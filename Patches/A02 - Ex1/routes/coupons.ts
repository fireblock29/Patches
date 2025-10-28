import { type Request, type Response, type NextFunction } from 'express'
import { BasketModel } from '../models/basket'
import * as security from '../lib/insecurity'

export const VALID_COUPONS = {
  'pEw8ph7Z^w': { code: 'OCT25-80', discount: 80 },
  'tR5s9abcXY': { code: 'NOV25-10', discount: 10 },
}

export function applyCoupon () {
  return async ({ params }: Request, res: Response, next: NextFunction) => {
    try {
      const id = params.id
      const couponParam = params.coupon ? decodeURIComponent(params.coupon) : undefined

      //Vérification serveur : coupon valide ?
      const couponInfo = couponParam ? VALID_COUPONS[couponParam] : null
      if (!couponInfo) {
        return res.status(404).send('Invalid or unauthorized coupon.')
      }

      //Recherche du panier et mise à jour
      const basket = await BasketModel.findByPk(id)
      if (!basket) {
        return next(new Error(`Basket with id=${id} does not exist.`))
      }

      await basket.update({ coupon: couponInfo.code })
      return res.json({ discount: couponInfo.discount })
    } catch (error) {
      next(error)
    }
  }
}