var express = require("express")
var router =  express.Router()
var xuly = require('../CRUD/housetask')
var moment = require('moment')
const exceljs = require('exceljs');
const fs = require('fs')
const axios = require('axios');
const path = require('path')
const sharp = require('sharp');
const { createCanvas, loadImage, registerFont } = require('canvas');

router.get('/api/them', async function(req, res){
    let docs = await xuly.docs({})
    res.render('admin_house/main/view_them_housetask', {docs, moment})
})
router.get('/api/view', async function(req, res){
    const khuvuc = req.query.khuvuc || ''
    let docs = await xuly.docs({khuvuc: {$regex: khuvuc}})
    res.render('admin_house/main/view_housetask', {data: docs, moment})
})
router.get('/api/congviec/:id', async (req, res) => {
    let body = req.params.id
    let docs = await xuly.docs({_id: body})
    // console.log(docs)
    res.send({cv: docs[0]})
})
module.exports = router