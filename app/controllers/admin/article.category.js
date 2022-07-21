const utils99 = require('node-utils99')
const S = require('fluent-schema')
const service = require('../../services/article_category.js')


let _t = {

    get_opts: {
        schema: {
            querystring: S.object()
            // .prop('page', S.integer())
            // .prop('size', S.integer())
        }
    },
    async get(request, reply) {
        // const query = request.query
        let res = await service.list()
        return {
            flag: 'ok',
            data: res
        }
    },


    post_opts: {
        schema: {
            body: S.object()
                .prop('label', S.string().minLength(1).required())
                .prop('sort', S.integer().required())
        }
    },
    async post(request, reply) {
        const body = request.body
        const label = body.label
        const sort = body.sort
        const res = await service.add(label, sort)
        return { flag: 'ok', data: res }
    },


    put_opts: {
        schema: {
            body: S.object()
                .prop('id', S.integer().required())
                .prop('label', S.string().minLength(1).required())
                .prop('sort', S.integer().required())
        }
    },
    async put(request, reply) {
        const body = request.body
        const id = body.id
        const label = body.label
        const sort = body.sort
        const res = await service.update(id, label, sort)
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