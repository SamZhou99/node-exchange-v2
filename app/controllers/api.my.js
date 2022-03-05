const S = require('fluent-schema')
const utils99 = require('node-utils99')
const service_login_log = require('../services/login_log.js');
const service_auth = require('../services/auth.js');
const service_withdraw = require('../services/withdraw_log.js');

let _t = {
    login_log: {
        opts: {
            schema: {
                querystring: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('page', S.integer())
                    .prop('size', S.integer())
            }
        },
        async get(request, reply) {
            const query = request.query
            const page = query.page || 1
            const size = query.size || 10
            const start = (page - 1) * size
            const user_id = query.user_id
            const resObject = await service_login_log.list(user_id, service_login_log.UserType.MEMBER, start, size)
            const list = resObject.list
            const total = resObject.total
            reply.send({ flag: 'ok', data: { list, page: { total, page, size } } })
            return
        }
    },

    upload_photo: {
        opts: {
            schema: {
                querystring: S.object()
                    .prop('user_id', S.integer().required())
            }
        },
        async post(request, reply) {
            const query = request.query
            const user_id = query.user_id
            const files = request.raw.files
            let fileArr = []
            for (let key in files) {
                fileArr.push({
                    name: files[key].name,
                    mimetype: files[key].mimetype
                })
            }
            // const new_file_name = `./public/uploads/${files.file.name}`
            const time = utils99.Time().replace(/ /g, '').replace(/-/g, '').replace(/:/g, '')
            const random = String(Math.random()).replace('.', '')
            const extens_name = files.file.name.substring(files.file.name.lastIndexOf('.') + 1)
            const new_file_name = `authentication-${user_id}-${time}-${random}.${extens_name}`
            const file_path = `./public/uploads/${new_file_name}`
            files.file.mv(file_path, async (err) => {
                if (err) {
                    return request.status(500).send(err);
                }
                const photo_res = await service_auth.addPhoto(user_id, new_file_name)
                console.log('上传照片成功')
                console.log(photo_res)
                return reply.send({ flag: 'ok', data: new_file_name })
            })
        },
    },

    authentication: {
        opts: {
            schema: {
                body: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('country', S.string().required())
                    .prop('full_name', S.string().required())
                    .prop('id_number', S.string().required())
            }
        },
        async post(request, reply) {
            const body = request.body
            const user_id = body.user_id
            const country = body.country
            const full_name = body.full_name
            const id_number = body.id_number
            // 状态：0未认证,1待审核,2未通过,3通过
            const status = 1
            const failed_reason = ''
            const addAuthInfoRes = await service_auth.addAuthInfo(user_id, status, failed_reason, country, full_name, id_number)
            console.log(addAuthInfoRes)
            return reply.send({ flag: 'ok', data: { body } })
        },
        get_opts: {
            schema: {
                querystring: S.object()
                    .prop('user_id', S.integer().required())
            }
        },
        async get(request, reply) {
            const query = request.query
            const user_id = query.user_id
            const auth_res = await service_auth.oneById(user_id)
            const photo_res = await service_auth.photoList(user_id, 0, 100)
            return reply.send({
                flag: 'ok', data: {
                    authInfo: auth_res,
                    photoInfo: photo_res,
                }
            })
        }
    },

    withdraw: {
        get_opts: {
            schema: {
                querystring: S.object()
                    .prop('user_id', S.integer().required())
            }
        },
        async get(request, reply) {
            const query = request.query
            const page = parseInt(query.page) || 1
            const size = parseInt(query.size) || 10
            const start = (page - 1) * size
            const user_id = query.user_id

            const auth_res = await service_auth.oneById(user_id)
            const withdraw_res = await service_withdraw.list(user_id, start, size)
            const list = withdraw_res.list
            const total = withdraw_res.total
            return reply.send({
                flag: 'ok', data: {
                    authInfo: auth_res,
                    list,
                    page: { total, page, size }
                }
            })
        },
        post_opts: {
            schema: {
                body: S.object()
                    .prop('user_id', S.integer().required())
                    .prop('country', S.string().required())
                    .prop('full_name', S.string().required())
                    .prop('id_number', S.string().required())
            }
        },
        async post(request, reply) {
            // 
        },
    }
}
module.exports = _t



// const bodyJsonSchema = S.object()
//   .prop('someKey', S.string())
//   .prop('someOtherKey', S.number())
//   .prop('requiredKey', S.array().maxItems(3).items(S.integer()).required())
//   .prop('nullableKey', S.mixed([S.TYPES.NUMBER, S.TYPES.NULL]))
//   .prop('multipleTypesKey', S.mixed([S.TYPES.BOOLEAN, S.TYPES.NUMBER]))
//   .prop('multipleRestrictedTypesKey', S.oneOf([S.string().maxLength(5), S.number().minimum(10)]))
//   .prop('enumKey', S.enum(Object.values(MY_KEYS)))
//   .prop('notTypeKey', S.not(S.array()))

// const queryStringJsonSchema = S.object()
//   .prop('name', S.string())
//   .prop('excitement', S.integer())

// const paramsJsonSchema = S.object()
//   .prop('par1', S.string())
//   .prop('par2', S.integer())

// const headersJsonSchema = S.object()
//   .prop('x-foo', S.string().required())

// // Note that there is no need to call `.valueOf()`!
// const schema = {
//   body: bodyJsonSchema,
//   querystring: queryStringJsonSchema, // (or) query: queryStringJsonSchema
//   params: paramsJsonSchema,
//   headers: headersJsonSchema
// }