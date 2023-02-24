const Product = require('../models/product')

const getAllProductsStatic = async (req, res) => {
    const products = await Product.find({})
    res.status(200).json({ products, nbHits: products.length })
}

const getAllProducts = async (req, res) => {
    const { featured, company, name, sort, fields, numericFilters } = req.query;
    const queryObject = {}

    if (featured) {
        queryObject.featured = featured === 'true' ? true : false;
    }

    if (company) {
        queryObject.company = company
    }

    if (name) {
        queryObject.name = { $regex: name, $options: 'i' }
    }

    if (numericFilters) {
        // mapping of sign to query operators
        const operatorMap = {
            '>': '$gt',
            '>=': '$gte',
            '=': '$eq',
            '<': '$lt',
            '<=': '$lte',
        }

        // regEx for matching the sign and replacing with query operators with `-{hyphen}-`
        const regEx = /\b(<|>|>=|=|<|<=)\b/g;
        let filters = numericFilters.replace(
            regEx,
            (match) => `-${operatorMap[match]}-`
        );

        // taking options we have to filter
        const options = ['price', 'rating'];

        // generating queryOperator from the string we get after redEx filter
        filters = filters.split(',').forEach((item) => {
            const [field, operator, value] = item.split('-');
            if (options.includes(field)) {
                queryObject[field] = { [operator]: Number(value) };
            }
        });
    }

    // console.log(queryObject);

    // final queryObject for search in the db
    let result = Product.find(queryObject)


    //--- After retrieving data sorting and pagination take place ---//

    if (sort) {
        // console.log(sort)
        const sortList = sort.split(',').join(' ')
        // console.log(sortList)
        result = result.sort(sortList)
    }

    if (fields) {
        const fieldsList = fields.split(',').join(' ')
        result = result.select(fieldsList)
    }

    // code for pagination
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = (page - 1) * limit;

    result.skip(skip).limit(limit)

    const products = await result

    res.status(200).json({ nbHits: products.length, products })
}


module.exports = { getAllProducts, getAllProductsStatic }