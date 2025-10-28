import { type Request, type Response, type NextFunction } from 'express'
import { ProductModel } from '../models/product'
import { BasketModel } from '../models/basket'
import * as challengeUtils from '../lib/challengeUtils'

import * as utils from '../lib/utils'
import * as security from '../lib/insecurity'
import { challenges } from '../data/datacache'

export function retrieveBasket () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10)
      const basket = await BasketModel.findOne({
        where: { id },
        include: [{ model: ProductModel, paranoid: false, as: 'Products' }]
      })

      const user = security.authenticatedUsers.from(req)
      if (!basket || !user) {
        return res.status(404).json({ error: 'Basket not found or user not authenticated' })
      }

      // Vérification minimale : le panier doit appartenir à l'utilisateur ou il doit être admin
      if (basket.UserId !== user.id && !(user.roles?.includes('admin'))) {
        return res.status(403).json({ error: 'Forbidden: not owner of basket' })
      }

      // Normalisation des noms de produits
      if (basket.Products?.length > 0) {
        basket.Products.forEach(product => {
          product.name = req.__(product.name)
        })
      }

      res.json(utils.queryResultToJson(basket))
    } catch (error) {
      next(error)
    }
  }
}