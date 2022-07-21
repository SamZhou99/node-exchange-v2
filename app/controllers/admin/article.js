const utils99 = require('node-utils99')
const S = require('fluent-schema')
const service = require('../../services/article.js')
const service_article_category = require('../../services/article_category.js')


let _t = {

    get_opts: {
        schema: {
            querystring: S.object()
                .prop('page', S.integer())
                .prop('size', S.integer())
        }
    },
    async get(request, reply) {
        const query = request.query
        const page = query.page || 1
        const size = query.size || 10
        const start = (page - 1) * size
        let res = await service.list(start, size)
        for (let i = 0; i < res.list.length; i++) {
            let item = res.list[i]
            item['category'] = await service_article_category.oneById(item.category_id)
        }
        return {
            flag: 'ok',
            data: {
                list: res.list,
                page: { total: res.total, page, size }
            }
        }
    },



    getItem_opts: {
        schema: {
            querystring: S.object()
                .prop('id', S.integer())
        }
    },
    async getItem(request, reply) {
        const query = request.query
        const id = query.id
        let res = await service.oneById(id)
        res['category'] = await service_article_category.oneById(res.category_id)
        return {
            flag: 'ok',
            data: res
        }
    },


    post_opts: {
        schema: {
            body: S.object()
                .prop('title', S.string().minLength(1).required())
                .prop('content', S.string().minLength(1).required())
                .prop('category_id', S.integer().required())
                .prop('sort', S.integer().required())
        }
    },
    async post(request, reply) {
        const body = request.body
        const title = body.title
        const content = body.content
        const category_id = body.category_id
        const sort = body.sort
        const res = await service.add(title, content, category_id, sort)
        return { flag: 'ok', data: res }
    },


    put_opts: {
        schema: {
            body: S.object()
                .prop('id', S.integer().required())
                .prop('title', S.string().minLength(1).required())
                .prop('content', S.string().minLength(1).required())
                .prop('category_id', S.integer().required())
                .prop('sort', S.integer().required())
        }
    },
    async put(request, reply) {
        const body = request.body
        const id = body.id
        const title = body.title
        const content = body.content
        const category_id = body.category_id
        const sort = body.sort
        const create_datetime = body.create_datetime
        const res = await service.update(id, title, content, category_id, sort, create_datetime)
        return { flag: 'ok', data: res }
    },


    delete_opts: {
        schema: {
            body: S.object()
                .prop('id', S.integer().required())
        }
    },
    async delete(request, reply) {
        const body = request.body
        const id = body.id
        const res = await service.delete(id)
        return { flag: 'ok', data: res }
    },

}




module.exports = _t