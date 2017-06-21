var express = require('express');
var router = express.Router();
var db = require('mysql');

var connection = db.createConnection({
    host: '127.0.0.1',
    user: 'x',
    password: 'x',
    database: 'classicmodels'
  });
  connection.connect;

/* GET home page. */
router.get('/', function(req, res, next) {

  var productLineQuery = `SELECT * from productlines;`;
  var products = [];
  var descriptions = [];
  connection.query(productLineQuery, (error, results)=> {
    if(error) throw error;
    for (let i = 0; i < results.length; i++) {
      products.push(results[i].productLine)
    }

    
    
    

  res.render('index', { 
    title: 'Classic Models',
    product: products
  });
  })
  
});

router.get('/:val', (req, res, next)=> {
  

var description = '';
var productList = [];
var descriptionQuery = `SELECT textDescription from productlines WHERE productLine = '${req.params.val}';`;
var productNamesQuery = `SELECT productName FROM products WHERE productLine = '${req.params.val}';`;
connection.query(descriptionQuery, (error, results)=> {
  if(error) throw error;
  description = results[0].textDescription;
  
  connection.query(productNamesQuery, (error, results)=> {
    if(error) throw error
    for (let i = 0; i < results.length; i++) {
      productList.push(results[i].productName)
    }

  


  res.render(req.params.val, {
    description: description,
    productList: productList
  })
})
})
})

router.get('/products/:val', (req, res, next)=> {
  var productInfo = [];
  var productInfoQuery = `SELECT productCode, productName, productLine, productScale, productVendor, productDescription, quantityInStock, buyPrice, MSRP FROM products where productName = '${req.params.val}';`;

  connection.query(productInfoQuery, (error, results)=> {
    if(error) throw error;
    for (let i = 0; i < results.length; i++) {
      productInfo.push(results[i])
    }
    console.log(productInfo);

    var ordersByProdNum = `SELECT * FROM orderdetails INNER JOIN products WHERE orderdetails.productCode = '${productInfo[0].productCode}';`
 
    var orderTotal;
    var totalOrdered = 0;
    var orderNumbers = [];
    connection.query(ordersByProdNum, (error, results)=> {
        orderTotal = results.length;
        for (i=0; i < results.length; i++) {
          totalOrdered += (results[i].quantityOrdered);
          orderNumbers.push(results[i].orderNumber)
        }
        
    res.render(req.params.val, {
      productInfo: productInfo,
      orderTotal: orderTotal,
      totalOrdered: totalOrdered,
      orderNumbers: orderNumbers
    })
    })
  })

  router.get('/order/:val', (req, res, next)=> {
    var orderProduct;
    var customerInfo;
    var employeeInfo;
    var employeeInfo2;
    var orderStatus;
    var totalOrderAmount;

    var orderProductQuery = `SELECT productName FROM products INNER JOIN orderdetails ON orderNumber = '${req.params.val}' and products.productCode = orderdetails.productCode;`;

    var orderCustomerInfo = `SELECT customers.customerNumber, customers.customerName, customers.city from customers INNER JOIN orders ON orders.orderNumber = '${req.params.val}' and orders.customerNumber = customers.customerNumber;`;

     

  
    var productCodes = [];
    connection.query(orderProductQuery, (error, results)=> {
      for (let i = 0; i < results.length; i++) {
        productCodes.push(results[i])
        
      }

      connection.query(orderCustomerInfo, (error, results)=> {
        customerInfo = results;
      
      var employeeQuery = `SELECT firstName, lastName, officeCode, reportsTo FROM employees INNER JOIN customers on customers.salesRepEmployeeNumber = employees.employeeNumber and customers.customerNumber = '${customerInfo[0].customerNumber}';`

      connection.query(employeeQuery, (error, results)=> {
        employeeInfo = results;
        console.log(employeeInfo);
      
      var employeeQuery2 = `SELECT offices.city, employees.firstName, employees.lastName FROM offices INNER JOIN employees ON offices.officeCode = '${employeeInfo[0].officeCode}' and employees.employeeNumber = '${employeeInfo[0].reportsTo}';`

      connection.query(employeeQuery2, (errors, results)=> {
        employeeInfo2 = results;
      
      var orderQuery = `SELECT status, SUM(quantityOrdered*priceEach) AS totalOrderAmount FROM orders INNER JOIN orderdetails ON orders.orderNumber = '${req.params.val}' AND orderdetails.orderNumber = '${req.params.val}';`

      connection.query(orderQuery, (errors, results)=> {
        orderStatus = results[0].status;
        totalOrderAmount = results[0].totalOrderAmount;
      

      console.log(orderStatus);
      console.log(totalOrderAmount);
      var path = req.path;
      path = path.slice(7, 12);
      

      res.render(req.params.val, {
        productCodes: productCodes,
        path: path,
        customerInfo: customerInfo,
        employeeInfo:employeeInfo,
        employeeInfo2: employeeInfo2,
        orderStatus: orderStatus,
        totalOrderAmount: totalOrderAmount
      })
    })
  })
})
})
})
})


});

module.exports = router;
