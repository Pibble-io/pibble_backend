import { Invoice, Post, Commerce, Good } from '../models';
import InvoiceResource from "../resources/InvoiceResource";
import LocalizationError from '../utils/localizationError';

export async function internalInvoice(fromUser, toUser, coin, value, description) {
    const invoice = await Invoice.create({
        value: value,
        coin_id: coin.id,
        from_user_id: fromUser,
        to_user_id: toUser,
        description: description,
        type: 'internal',
        status: 'requested'
    });

    return await InvoiceResource.create(invoice);
}

export async function digitalGoodsInvoice(fromUser, toUser, coin, value, description, post_id) {

    if (!post_id) {
        throw new LocalizationError('Post is required.');
    }

    let post = await Post.findOne({
        where: { id: post_id },
        include: [
            {
                model: Commerce,
                as: 'commerce'
            }
        ]
    });

    if (!post) {
        throw new LocalizationError('Post is not found.');
    }

    if (post.type !== 'digital_goods') {
        throw new LocalizationError('It is not digital goods post.');
    }

    // if (post.invoices.length) {
    //   throw new Error(`You have already buyed this post`);
    // }

    if (post.commerce.status !== 'success') {
        throw new LocalizationError('Digital Good does not ready to buying.');
    }

    if (post.commerce.price !== value) {
        throw new LocalizationError('Incorect price. Should be %s PIB.', post.commerce.price);
    }

    const [invoice, isNewInvoice] = await Invoice.findOrCreate({
        where: { to_user_id: toUser, status: ['requested', 'accepted'], post_id },
        defaults: {
            value: value,
            coin_id: coin.id,
            from_user_id: fromUser,
            to_user_id: toUser,
            description: description,
            type: 'digital_goods',
            status: 'requested',
            post_id
        }
    });

    return await InvoiceResource.create(invoice);
}