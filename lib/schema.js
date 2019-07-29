const { gql } = require('apollo-server');

module.exports = gql`
#region Scalars

scalar DateTime

#endregion

#region Enums

"""
The type of product: Physical or Digital
"""
enum ProductType {
    """A physical product"""
    physical
    """A digital download"""
    digital
}

"""
Values are: 
    - \`none\`: inventory levels will not be tracked
    - \`product\`: inventory levels will be tracked using the \`inventory_level\` and \`inventory_warning_level\` fields
    - \`variant\`: inventory levels will be tracked based on variants, which maintain their own warning levels and inventory levels.
"""
enum InventoryTrackingMode {
    none
    product
    variant
}

"""
Availability status of a product.
"""
enum ProductAvailability{
    available
    disabled
    preorder
}

"""
Types of Gift Wrapping supported.
"""
enum GiftWrappingOptionsType {
    any
    none
    list
}

"""
Condition of a product
"""
enum ProductCondition {
    New
    Used
    Refurbished
}

"""
Supported Open Graph types.
"""
enum OpenGraphType {
    product
    album
    book
    drink
    food
    game
    movie
    song
    tv_show
}

"""
Supported Video Hosting Providers.
"""
enum VideoHostingProvider{
    youtube
    vimeo
}

"""
Supported ways to sort products.
"""
enum ProductSortType {
    use_store_settings
    featured
    newest
    best_selling
    alpha_asc
    alpha_desc
    avg_customer_review
    price_asc
    price_desc
}

"""
The types of entity CustomURLs can stand for.
"""
enum URLEntityType {
    product
    category
}

#endregion

#region Types

"""Common Product properties"""
type Product {
    """The product ID"""
    id: ID!
    """The product name"""
    name: String!
    """The product type. One of: \`physical\` - a physical stock unit, \`digital\` - a digital download."""
    type: ProductType!
    """User defined product code/stock keeping unit (SKU)."""
    sku: String
    """The product description, which can include HTML formatting."""
    description: String
    """Weight of the product, which can be used when calculating shipping costs. This is based on the unit set on the store"""
    weight: Float
    """Width of the product, which can be used when calculating shipping costs."""
    width: Float
    """Depth of the product, which can be used when calculating shipping costs."""
    depth:  Float
    """Height of the product, which can be used when calculating shipping costs."""
    height: Float
    """The price of the product. The price should include or exclude tax, based on the store settings."""
    price: Float
    """The cost price of the product. Stored for reference only; it is not used or displayed anywhere on the store."""
    costPrice: Float
    """The retail cost of the product. If entered, the retail cost price will be shown on the product page."""
    retailPrice: Float!
    """If entered, the sale price will be used instead of value in the price field when calculating the product's cost."""
    salePrice: Float
    """The ID of the tax class applied to the product. (NOTE: Value ignored if automatic tax is enabled.)"""
    taxClassId: Int
    """Accepts AvaTax System Tax Codes, which identify products and services that fall into special sales-tax categories. By using these codes, merchants who subscribe to BigCommerce's Avalara Premium integration can calculate sales taxes more accurately. Stores without Avalara Premium will ignore the code when calculating sales tax. Do not pass more than one code. The codes are case-sensitive. For details, please see Avalara's documentation."""
    productTaxCode: String
    """The categories to which this product belongs."""
    categories: [ProductCategory!]!
    """A product can be added to an existing brand during creation or modification."""
    brand: String
    """Current inventory level of the product for products with simple inventory tracking enabled."""
    inventoryLevel: Int
    """Inventory warning level for products with simple inventory tracking enabled.. When the product's inventory level drops below the warning level, the store owner will be informed."""
    inventoryWarningLevel: Int
    """The type of inventory tracking for the product."""
    inventoryTracking: InventoryTrackingMode
    """A fixed shipping cost for the product. If defined, this value will be used during checkout instead of normal shipping-cost calculation."""
    fixedCostShippingPrice: Float
    """Flag used to indicate whether the product has free shipping. If \`true\`, the shipping cost for the product will be zero."""
    isFreeShipping: Boolean
    """Flag to determine whether the product should be displayed to customers browsing the store. If \`true\`, the product will be displayed. If \`false\`, the product will be hidden from view."""
    isVisible: Boolean
    """Flag to determine whether the product should be included in the \`featured products\` panel when viewing the store."""
    isFeatured: Boolean
    """An array of related products."""
    relatedProducts: [Product!]
    """Warranty information displayed on the product page. Can include HTML formatting."""
    warranty: String
    """The BIN picking number for the product."""
    binPickingNumber: String
    """The product UPC code, which is used in feeds for shopping comparison sites and external channel integrations."""
    upc: String
    """A list of keywords that can be used to locate the product when searching the store."""
    searchKeywords: [String!]
    """Availability of the product. Availability options are: \`available\` - the product can be purchased on the storefront; \`disabled\` - the product is listed in the storefront, but cannot be purchased; \`preorder\` - the product is listed for pre-orders."""
    availability: ProductAvailability
    """Availability text displayed on the checkout page, under the product title. Tells the customer how long it will normally take to ship this product, such as: 'Usually ships in 24 hours.'"""
    availabilityDescription: String
    """Type of gift-wrapping options. Values: \`any\` - allow any gift-wrapping options in the store; \`none\` - disallow gift-wrapping on the product; \`list\` – provide a list of IDs in the \`gift_wrapping_options_list\` field."""
    giftWrappingOptionsType: GiftWrappingOptionsType!
    """Priority to give this product when included in product lists on category pages and in search results. Lower integers will place the product closer to the top of the results."""
    sortOrder: Int
    """The product condition. Will be shown on the product page if the \`is_condition_shown\` field's value is \`true\`. Possible values: \`New\`, \`Used\`, \`Refurbished\`."""
    condition: ProductCondition!
    """Flag used to determine whether the product condition is shown to the customer on the product page."""
    isConditionShown: Boolean
    """The minimum quantity an order must contain, to be eligible to purchase this product."""
    orderQuantityMinimum: Int
    """The maximum quantity an order can contain when purchasing the product."""
    orderQuantityMaximum: Int
    """Custom title for the product page. If not defined, the product name will be used as the meta title."""
    pageTitle: String
    """Custom meta keywords for the product page. If not defined, the store's default keywords will be used."""
    metaKeywords: [String!]
    """Custom meta description for the product page. If not defined, the store's default meta description will be used."""
    metaDescription: String
    """The number of times the product has been viewed."""
    viewCount: Int
    """Pre-order release date. See the \`availability\` field for details on setting a product's availability to accept pre-orders."""
    preorderReleaseDate: DateTime
    """Custom expected-date message to display on the product page. If undefined, the message defaults to the storewide setting. Can contain the \`%%DATE%%\` placeholder, which will be substituted for the release date."""
    preorderMessage: String
    """If set to true then on the preorder release date the preorder status will automatically be removed.  
    If set to false, then on the release date the preorder status **will not** be removed. It will need to be changed manually either in the
    control panel or using the API. Using the API set \`availability\` to \`available\`.
    """
    isPreorderOnly: Boolean!
    """False by default, indicating that this product's price should be shown on the product page. If set to \`true\`, the price is hidden. (NOTE: To successfully set \`is_price_hidden\` to \`true\`, the \`availability\` value must be \`disabled\`.)"""
    isPriceHidden: Boolean!
    """By default, an empty string. If \`is_price_hidden\` is \`true\`, the value of \`price_hidden_label\` is displayed instead of the price. (NOTE: To successfully set a non-empty string value with \`is_price_hidden\` set to \`true\`, the \`availability\` value must be \`disabled\`.)"""    
    priceHiddenLabel: String
    """The custom URL for the product on the storefront."""
    customUrl: CustomURL
    """Type of product, defaults to \`product\`."""
    openGraphType: OpenGraphType!
    """Title of the product, if not specified the product name will be used instead."""
    openGraphTitle: String
    """Description to use for the product, if not specified then the meta_description will be used instead."""
    openGraphDescription: String
    """Flag to determine if product description or open graph description is used."""
    openGraphUseMetaDescription: Boolean
    """Flag to determine if product name or open graph name is used."""
    openGraphUseProductName: Boolean
    """Flag to determine if product image or open graph image is used."""
    openGraphUseImage: Boolean
    """Global Trade Item Number"""
    gtin: String
    """Manufacturer Part Number"""
    mpn: String
    """The aggregated rating for the product."""
    aggregatedRating: Float
    """The number of times the product has been rated."""
    reviewCount: Int
    """The total quantity of this product sold."""
    totalSold: Int
    """Custom fields associated with a product."""
    customFields: [CustomField!]
    # """Common BulkPricingRule properties"""
    # bulk_pricing_rules: array
    """The date on which the product was created."""
    createdOn: DateTime
    """The date on which the product was last modified."""
    modifiedOn: DateTime
    """Product Images"""
    images: [ProductImage!]
    """Product Videos"""
    videos: [ProductVideo!]
    """Product variants, if any."""        
    variants: [ProductVariant!]
    """[BigCommerce] 
    The layout template file used to render this product. 
    This field is writable only for stores with a Blueprint theme applied.
    """
    layoutFile: String
}

"""The custom URL for an entity on the storefront."""
type CustomURL {
    """Entity URL on the storefront."""
    url: String!
    """Returns \`true\` if the URL has been changed from its default state (the auto-assigned URL that BigCommerce provides)."""
    isCustomized: Boolean!
    """The type of entity the URL stands for"""
    entityType: URLEntityType!
}

"""
Custom fields associated with a product. 
These allow you to specify additional information that will appear on the product's page,
such as a book's ISBN or a DVD's release date.
"""
type CustomField {
    """The name of the field, shown on the storefront, orders, etc."""
    name: String!
    """The value of the field, shown on the storefront, orders, etc."""
    value: String
}

"""Product Images"""
type ProductImage {
    """The unique numeric ID of the image; increments sequentially."""
    id: ID!
    """The unique numeric identifier for the product with which the image is associated."""
    productId: ID!
    """The local path to the original image file uploaded to BigCommerce."""
    fileName: String
    """The zoom URL for this image. By default, this is used as the zoom image on product pages when zoom images are enabled."""
    urlZoom: String
    """The standard URL for this image. By default, this is used for product-page images."""
    urlStandard: String
    """The thumbnail URL for this image. By default, this is the image size used on the category page and in side panels."""
    urlThumbnail: String
    """The tiny URL for this image. By default, this is the image size used for thumbnails beneath the product image on a product page."""
    urlTiny: String
    """The date on which the product image was created."""
    createdOn: DateTime
    """The date on which the product image was last modified."""
    modifiedOn: DateTime
    """The order in which the image will be displayed on the product page. Higher integers give the image a lower priority. When updating, if the image is given a lower priority, all images with a \`sort_order\` the same as or greater than the image's new \`sort_order\` value will have their \`sort_order\`s reordered."""
    sortOrder: Int
    """The description for the image."""
    description: String
    """Canonical image URL. Use when creating a product."""
    url: String
}

type ProductVideo {
    """The unique ID of the product video."""
    id: ID!
    """The unique numeric identifier for the product with which the image is associated."""
    productId: ID!
    """The ID of the video on a hosting provider's site."""        
    videoId: String!
    """The video hosting provider."""
    provider: VideoHostingProvider
    """The title for the video. If left blank, this will be filled in according to data on a host site."""
    title: String
    """The description for the video. If left blank, this will be filled in according to data on a host site."""
    description: String
    """The order in which the video will be displayed on the product page. Higher integers give the video a lower priority. When updating, if the video is given a lower priority, all videos with a \`sort_order\` the same as or greater than the video's new \`sort_order\` value will have their \`sort_order\`s reordered."""
    sortOrder: Int
    """Length of the video. This will be filled in according to data on a host site."""
    length: String
}

"""A productVariant"""
type ProductVariant {
    """The variant's unique ID"""
    id: ID!
    """The ID of the product associated to this variant"""
    productId: ID!
    """The variant's SKU"""
    sku: String
    """The cost price of the variant. Not affected by Price List prices."""
    costPrice: Float
    """This variant's base price on the storefront. 
    If a Price List ID is used, the Price List value will be used. 
    If a Price List ID is not used, and this value is \`null\`, the product's default price 
    (set in the Product resource''s \`price\` field) will be used as the base price.
    """
    price: Float
    """
    This variant''s sale price on the storefront. 
    If a Price List ID is used, the Price List value will be used. 
    If a Price List ID is not used, and this value is \`null\`, the product''s sale price 
    (set in the Product resource''s \`price\` field) will be used as the sale price.
    """
    salePrice: Float
    """
    This variant''s retail price on the storefront. 
    If a Price List ID is used, the Price List value will be used. 
    If a Price List ID is not used, and this value is null, the product's retail price 
    (set in the Product resource's \`price\` field) will be used as the retail price.
    """
    retailPrice: Float
    """
    This variant''s base weight on the storefront. 
    If this value is \`null\`, the product's default weight 
    (set in the Product resource's weight field) will be used as the base weight.
    """
    weight: Float
    """
    Width of the variant, which can be used when calculating shipping costs. 
    If this value is \`null\`, the product's default width 
    (set in the Product resource's \`width\` field) will be used as the base width.
    """
    width: Float
    """
    Height of the variant, which can be used when calculating shipping costs. 
    If this value is \`null\`, the product's default height 
    (set in the Product resource's \`height\` field) will be used as the base height.
    """
    height: Float
    """
    Depth of the variant, which can be used when calculating shipping costs. 
    If this value is \`null\`, the product's default depth 
    (set in the Product resource's \`depth\` field) will be used as the base depth.
    """
    depth: Float
    """Flag used to indicate whether the variant has free shipping. If \`true\`, the shipping cost for the variant will be zero."""
    isFreeShipping: Boolean
    """A fixed shipping cost for the variant. If defined, this value will be used during checkout instead of normal shipping-cost calculation."""
    fixedCostShippingPrice: Float
    """If \`true\`, this variant will not be purchasable on the storefront."""
    purchasingDisabled: Boolean
    """If \`purchasing_disabled\` is \`true\`, this message should show on the storefront when the variant is selected."""
    purchasingDisabledMessage: String
    """Inventory level for the variant, which is used when the product''s inventory_tracking is set to \`variant\`.'"""
    inventoryLevel: Int
    """When the variant hits this inventory level, it is considered low stock."""
    inventoryWarningLevel: Int
    """The UPC code used in feeds for shopping comparison sites and external channel integrations."""
    upc: String
    """Identifies where in a warehouse the variant is located."""
    binPickingNumber: String
    """The option values that make up this variant."""
    optionValues: [VariantOptionValue!]!
}

"""The option values that make up a product variant."""
type VariantOptionValue {
    """The unique ID of the variant option"""
    optionId: ID!
    """The display name of the option."""
    name: String!
    """The option value."""
    value: String!
}

"""
Product Category
"""
type ProductCategory {
    """
    Unique ID of the *Category*. Increments sequentially. Read-Only.
    """
    id: ID!
    """
    The name displayed for the category. Name is unique with respect to the category's siblings.
    """
    name: String!
    """
    The unique ID of the category's parent.
    This field controls where the category sits 
    in the tree of categories that organize the catalog.
    Required if creating a child category.
    """
    parentId: ID
    """
    The category description, which can include HTML formatting.
    """
    description: String
    """Number of views the category has on the storefront."""
    views: Int
    """
    Priority this category will be given when included 
    in the menu and category pages. The lower the number, 
    the closer to the top of the results the category will be.
    """
    sortOrder: Int
    """
    Custom title for the category page. 
    If not defined, the category name will be used as the meta title.
    """
    pageTitle: String
    """A list of keywords that can be used to locate the category when searching the store."""
    searchKeywords: [String!]
    """
    Custom meta keywords for the category page. If not defined, 
    the store's default keywords will be used. 
    """
    metaKeywords: [String!]
    """
    Custom meta description for the category page. If not defined, 
    the store's default meta description will be used.
    """
    metaDescription: String
    """[BigCommerce] 
    The layout template file used to render this product category. 
    This field is writable only for stores with a Blueprint theme applied.

    Please refer to https://support.bigcommerce.com/articles/Public/Creating-Custom-Template-Files.
    """
    layoutFile: String
    """
    Flag to determine whether the category should be displayed to customers browsing the store. 
    If \`true\`, the category will be displayed. 
    If \`false\`, the category will be hidden from view.
    """
    isVisible: Boolean
    """Determines how the products are sorted on category page load."""
    defaultProductSort: ProductSortType
    """
    Image URL used for this category on the storefront. 
    Images can be uploaded via form file post to \`/categories/{categoryId}/image\`, 
    or by providing a publicly accessible URL in this field.
    """
    imageUrl: String
    """The custom URL for the category on the storefront."""
    customUrl: CustomURL
}

#endregion

#region Inputs

"""
An input object for the \`CreateProductCategory\` operation.
"""
input CreateCategoryInput {
    """The name displayed for the category. Name is unique with respect to the category's siblings."""
    name: String!
    """The category description, which can include HTML formatting."""
    description: String
    """
    The unique ID of the category's parent.
    This field controls where the category sits 
    in the tree of categories that organize the catalog.
    Required if creating a child category.
    """
    parentId: ID
    """
    Priority this category will be given when included 
    in the menu and category pages. The lower the number, 
    the closer to the top of the results the category will be.
    """
    sortOrder: Int
    """
    Custom title for the category page. 
    If not defined, the category name will be used as the meta title.
    """
    pageTitle: String
    """A list of keywords that can be used to locate the category when searching the store."""
    searchKeywords: [String!]
    """
    Custom meta keywords for the category page. If not defined, 
    the store's default keywords will be used. 
    """
    metaKeywords: [String!]
    """
    Custom meta description for the category page. If not defined, 
    the store's default meta description will be used.
    """
    metaDescription: String
    """
    Flag to determine whether the category should be displayed to customers browsing the store. 
    If \`true\`, the category will be displayed. 
    If \`false\`, the category will be hidden from view.
    """
    isVisible: Boolean
    """Determines how the products are sorted on category page load."""
    defaultProductSort: ProductSortType
    """
    Image URL used for this category on the storefront. 
    Images can be uploaded via form file post to \`/categories/{categoryId}/image\`, 
    or by providing a publicly accessible URL in this field.
    """
    imageUrl: String
    """The custom URL for the category on the storefront."""
    customUrl: String
}

"""
An input object for the \`GetCategory\` operation.
"""
input GetCategoryInput {
    """The category ID"""
    id: ID!
}

#endregion

#region GraphQL artifacts

type Query {
    """
    Get all product categories.
    """
    categories: [ProductCategory!]!
    
    """
    Get a product category by ID.
    """
    category(input: GetCategoryInput!): ProductCategory!
}

type Mutation {
    """
    Create a new Product Category.
    """
    createCategory(input: CreateCategoryInput!): ProductCategory!
}

#endregion
`;