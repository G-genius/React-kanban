const router = require('express').Router({ mergeParams: true })
const tokenHandler = require('../handlers/tokenHandler')
const sectionController = require('../controllers/section')
const validation = require('../handlers/validation')
const {param} = require("express-validator");

router.put(
    '/:sectionId',
    param('sectionId').custom(value => {
        if(!validation.isObjectId(value)) {
            return Promise.reject('неверный id')
        }
        else {
            return Promise.resolve()
        }
    }),
        validation.validate,
        tokenHandler.verifyToken,
        sectionController.update
)

router.delete(
    '/:sectionId',
    param('sectionId').custom(value => {
        if(!validation.isObjectId(value)) {
            return Promise.reject('неверный id')
        }
        else {
            return Promise.resolve()
        }
    }),
    validation.validate,
    tokenHandler.verifyToken,
    sectionController.delete
)

module.exports = router