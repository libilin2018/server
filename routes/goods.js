var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Goods = require('../models/goods');
var User = require('../models/users');

//连接MongoDB数据库
mongoose.connect('mongodb://119.29.173.107:27017/demo');
mongoose.connection.on("connected", function() {
    console.log("MongoDB connected success.")
});

mongoose.connection.on("error", function() {
    console.log("MongoDB connected fail.")
});

mongoose.connection.on("disconnected", function() {
    console.log("MongoDB connected disconnected.")
});

router.get('/list', function(req, res, next) {
    // console.log(req.query.id);
    let page = parseInt(req.query.page);
    let pageSize = parseInt(req.query.pageSize);
    let sort = parseInt(req.query.sort);
    let skip = (page - 1) * pageSize;
    let priceRange = req.query.sortPriceRange.split('-');
    let priceGt = parseInt(priceRange[0]);
    let priceLte = parseInt(priceRange[1])
    let params = {},
        goodsModel;
    if (priceRange != 'all') {
        params = {
            salePrice: {
                $gt: priceGt,
                $lte: priceLte
            }
        }
    }
    // MyModel.find({}).sort({'_id':-1}).limit(6).exec(function(err,docs){})
    if (sort) {
        goodsModel = Goods.find(params).sort({ 'salePrice': sort }).skip(skip).limit(pageSize);
    } else {
        goodsModel = Goods.find(params).skip(skip).limit(pageSize);
    }

    goodsModel.exec(function(err, doc) {
            if (err) {
                res.json({
                    status: '1',
                    msg: err.message
                });
            } else {
                res.json({
                    status: '0',
                    msg: '',
                    result: {
                        count: doc.length,
                        list: doc
                    }
                });
            }
        })
        // res.end('hello world');
})

router.post("/addCart", function(req, res, next) {
    let userId = req.body.userId,
        productId = req.body.productId;
    User.findOne({ userId }, (err, userDoc) => {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (userDoc) {
                let goodsItem = '';
                userDoc.cartList.forEach(item => {
                    if (item.productId == productId) {
                        goodsItem = item;
                        item.productNum++;
                    }
                });
                if (goodsItem) {
                    userDoc.save((err1, doc1) => {
                        if (err1) {
                            res.json({
                                status: '1',
                                msg: err1.message
                            })
                        } else {
                            res.json({
                                status: '0',
                                msg: '添加购物车成功'
                            })
                        }
                    })
                } else {
                    Goods.findOne({ productId: productId }, (err2, doc2) => {
                        if (err2) {
                            res.json({
                                status: '1',
                                msg: err2.message
                            })
                        } else {
                            if (doc2) {
                                let newObj = {
                                    _id: doc2._id,
                                    productId: doc2.productId,
                                    productName: doc2.productName,
                                    salePrice: doc2.salePrice,
                                    productImage: doc2.productImage,
                                    productNum: 1,
                                    checked: 1
                                }
                                userDoc.cartList.push(newObj);
                                userDoc.save((err3, doc3) => {
                                    if (err3) {
                                        res.json({
                                            status: '1',
                                            msg: err3.message
                                        })
                                    } else {
                                        res.json({
                                            status: '0',
                                            msg: '插入成功'
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
            }
        }
    })
})

module.exports = router;