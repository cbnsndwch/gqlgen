#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const program = require('commander');
const colors = require('colors');
const _ = require('lodash');
const { compile: handlebars } = require('handlebars');
const { parse } = require('graphql');

const graphqlArtifactNames = [
    'Query',
    'Mutation',
    'Subscription',
    'root'
];

const scalarMap = {
    ID: 'string',
    String: 'string',
    Float: 'number',
    Int: 'number',
    Boolean: 'boolean',
    DateTime: 'Date',
    Dictionary: '{ [key: string]: any }'
};

function generate(schema) {

    const typeTemplate = loadTemplate('type');
    const types = schema.definitions
        .filter(def => def.kind === 'ObjectTypeDefinition' && graphqlArtifactNames.indexOf(def.name.value) === -1)
        .map(def => {
            return {
                name: def.name.value,
                description: def.description && def.description.value || '',
                fields: def.fields.map(field => {
                    const { type: graphqlType, isNullable, isArray } = getGraphqlType(field.type);

                    return {
                        name: field.name.value,
                        description: field.description && field.description.value || '',
                        graphqlType,
                        isNullable,
                        isArray,
                        type: scalarMap[graphqlType] || graphqlType
                    };
                })
            };
        })
        .map(type => {
            const contents = typeTemplate(type);
            return {
                filename: `types/${type.name}.ts`,
                contents
            };
        });

    const inputTemplate = loadTemplate('input');
    const inputs = schema.definitions
        .filter(def => def.kind === 'InputObjectTypeDefinition')
        .map(def => {
            return {
                name: def.name.value,
                description: def.description && def.description.value || '',
                fields: def.fields.map(field => {
                    const { type: graphqlType, isNullable, isArray } = getGraphqlType(field.type);
                    return {
                        name: field.name.value,
                        description: field.description && field.description.value || '',
                        graphqlType,
                        isNullable,
                        isArray,
                        type: scalarMap[graphqlType] || graphqlType
                    };
                })
            };
        })
        .map(input => {
            const contents = inputTemplate(input);
            return {
                filename: `inputs/${input.name}.ts`,
                contents
            };
        });

    const enumTemplate = loadTemplate('enum');
    const enums = schema.definitions
        .filter(def => def.kind === 'EnumTypeDefinition')
        .map(def => ({
            name: def.name.value,
            description: def.description && def.description.value || '',
            values: def.values.map(val => ({
                name: val.name.value,
                description: val.description && val.description.value || ''
            }))
        }))
        .map(enumType => {
            const contents = enumTemplate(enumType);
            return {
                filename: `types/${enumType.name}.ts`,
                contents
            };
        });

    const resolverTemplate = loadTemplate('resolver');
    const queryOperations = schema.definitions
        .filter(def => def.name.value === 'Query')[0]
        .fields
        .map(op => {
            const { type: graphqlType, isNullable, isArray } = getGraphqlType(op.type);
            const arguments = op.arguments.map(arg => {
                const { type: graphqlType, isNullable, isArray } = getGraphqlType(arg.type);
                return {
                    name: arg.name.value,
                    description: arg.description && arg.description.value || '',
                    graphqlType,
                    type: scalarMap[graphqlType] || graphqlType,
                    isNullable,
                    isArray
                };
            });
            return {
                name: op.name.value,
                description: op.description && op.description.value || '',
                graphqlType,
                type: scalarMap[graphqlType] || graphqlType,
                isNullable,
                isArray,
                arguments,
                hasArguments: arguments.length > 0
            };
        })
        .map(op => {
            const contents = resolverTemplate(op);
            return {
                filename: `resolvers/queries/${op.name}.ts`,
                contents
            };
        });

    const mutationOperations = schema.definitions
        .filter(def => def.name.value === 'Mutation')[0]
        .fields
        .map(op => {
            const { type: graphqlType, isNullable, isArray } = getGraphqlType(op.type);
            const arguments = op.arguments.map(arg => {
                const { type: graphqlType, isNullable, isArray } = getGraphqlType(arg.type);
                return {
                    name: arg.name.value,
                    description: arg.description && arg.description.value || '',
                    graphqlType,
                    type: scalarMap[graphqlType] || graphqlType,
                    isNullable,
                    isArray
                };
            });
            return {
                name: op.name.value,
                description: op.description && op.description.value || '',
                graphqlType,
                type: scalarMap[graphqlType] || graphqlType,
                isNullable,
                isArray,
                arguments,
                hasArguments: arguments.length > 0
            };
        })
        .map(op => {
            const contents = resolverTemplate(op);
            return {
                filename: `resolvers/mutations/${op.name}.ts`,
                contents
            };
        });

    return [
        ...inputs,
        ...enums,
        ...types,
        ...queryOperations,
        ...mutationOperations
    ];
}

function getGraphqlType(fieldType) {
    switch (fieldType.kind) {
        case 'NamedType':
            // type specified directly
            return getNullableGraphqlType(fieldType);
        case 'NonNullType':
            // non-nullable type with nested actual type
            if (fieldType.type.kind === 'NamedType') {
                const nestedNamedType = getNullableGraphqlType(fieldType.type);
                return {
                    type: nestedNamedType.type,
                    isNullable: false,
                    isArray: false
                };
            } else if (fieldType.type.kind === 'ListType') {
                const nestedListType = getListItemGraphqlType(fieldType.type.type);
                return {
                    type: nestedListType,
                    isNullable: false,
                    isArray: true
                };
            }

            throw new Error('Unsupported type hierarchy')
        case 'ListType':
            // list type, need to futher inspect nested type specifications
            const nestedListType = getListItemGraphqlType(fieldType.type.type);
            return {
                type: nestedListType,
                isNullable: true,
                isArray: true
            };
        default:
            throw new Error('Unsupported case');
    }
}

function getNullableGraphqlType(fieldType) {
    // type specified directly
    return {
        type: fieldType.name.value,
        isNullable: true,
        isArray: false
    };
}

function getListItemGraphqlType(fieldType) {
    if (fieldType.kind === 'NonNullType') {
        return fieldType.type.name.value;
    } else if (fieldType.kind === 'NamedType') {
        return fieldType.name.value;
    }

    throw new Error('Unsupported type nesting level');
}

function loadTemplate(name) {
    const filePath = path.resolve(__dirname, 'templates', name + '.hbs');
    const contents = fs.readFileSync(filePath, 'utf8');
    const template = handlebars(contents);

    return template;
}

program
    .version('0.1.0')
    .command('generate')
    .description('Generate code from GraphQL schema')
    .option('-s, --schema', 'Path to input schema file')
    .option('-o, --output-directory', 'Output directory')
    .action((schemaFilePath, outputDirectory) => {
        const schemaContents = fs.readFileSync(schemaFilePath, 'utf8');
        const schema = parse(schemaContents);

        const files = generate(schema);

        for (const file of files) {
            const outputFilename = path.resolve(outputDirectory, file.filename);
            const dir = path.dirname(outputFilename);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }

            fs.writeFileSync(outputFilename, file.contents, 'utf8');
        }
    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp(colors.red);
}
