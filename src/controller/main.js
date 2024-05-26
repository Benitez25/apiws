const poolQuery = require('../../database')
const fs = require('fs');
const moment = require('moment');

const controllerApp = {
    login: async function(req, res){
        const {user, pwd} = req.body
        try {
            if(!user || !pwd) {
                return res.status(202).send({error: 'Debe completar las credenciales.'})
            }

            const usuario = await poolQuery.query(`Select * From usuario Where user = ?`, [user])

            if(!usuario[0]){
                return res.status(202).send({error: 'Usuario no Existe.'})
            }
            
            if(usuario[0].password != pwd){
                return res.status(202).send({error: 'Usuario no Existe.'})
            }

            return res.status(202).send({res: usuario[0]})
            
        } catch (error) {
            return res.status(400).send({error: 'Error conexión.'})
        }
    },
    createUser: async function(req, res){
        const {name, lastname, tel, email, pwd, latitude, longitude} = req.body
        try {
            if(!name || !lastname || !tel || !email || !pwd || !latitude || !longitude) {
                return res.status(202).send({error: 'Debe completar las credenciales.'})
            }

            await poolQuery.query(`
                Insert Into usuario(user, name, last_name, number, email, password, latitude, longitude) Values(${tel}, 
                                                                                            '${name}',  
                                                                                            '${lastname}', 
                                                                                            ${tel},
                                                                                            '${email}',
                                                                                            ${pwd},
                                                                                            ${latitude},
                                                                                            ${longitude})`)
            return res.send({res: 'Usuario creado.'})
        } catch (error) {
            return res.status(400).send({error: 'Error de conexion.'})
        }
    },
    updateUser: async function(req, res) {
        try {
            const {user, name, number, email} = req.body
            if(!user, !name || !number || !email) {
                return res.status(202).send({error: 'Debe completar las credenciales.'})
            }

            await poolQuery.query(`
                UPDATE usuario Set name = '${name}', 
                                number = ${number}, 
                                email = '${email}'
                    Where user = ${user};
            `)
            return res.send({res: 'Usuario modificado.'})            

        } catch (error) {
            return res.status(400).send({error: 'Error de conexion.'})
        }  
    },
    createPost: async function(req, res){
        const {name, type, description, latitude, longitude, id_user, image, horaCreatePost} = req.body
        try {
            if(!name || !type || !description){
                return res.status(202).send({error: 'Debe completar las credenciales.'})
            }

            let existOpenPost = await poolQuery.query(`Select count(1) cantidad From post Where id_user = ${id_user} And ind_adopt = 0`)
            if (existOpenPost[0].cantidad > 0){
                return res.status(202).send({error: 'Debe concretar la ultima publicación creada.'})
            }


            let valor = await poolQuery.query(`SELECT max(id) id FROM post`)
            let idPost = valor[0].id + 1

            await poolQuery.query(`
                Insert into post (id, title, type, description, latitude, longitude, image, id_user, ind_adopt, date_create)
                Values(${idPost}, '${name}', ${type}, '${description}', ${latitude}, ${longitude}, '${image}', ${id_user}, 0, now());
            `)

            let timeTransConsult = moment().diff(moment(horaCreatePost), 'minutes')
            console.log(timeTransConsult)
            await poolQuery.query(`Insert into tiemp_regi_publ(id_user, id_post, hora_inic_regi, hora_creacion, mini_trans) 
                                        Values(${id_user}, ${idPost}, '${moment(horaCreatePost).format('YYYY-MM-DD HH:mm')}', now(), ${timeTransConsult})`)

            return res.send({res: 'Post creado.', id_post: idPost})
        } catch (error) {
            console.log(error)
            return res.status(400).send({error: 'Error de conexion.'})
        }
    },
    updateImgAdopPost: async function(req, res){
        const {idPost} = req.body

        try {
            if (!req.file) {
                return res.status(400).send({ error: 'No se recibió ninguna imagen' });
            }
            const base64Data = req.file.buffer
            const bufferData = Buffer.from(base64Data).toString('base64');

            await poolQuery.query(`UPDATE post Set image = '${bufferData}' where id = ${idPost};`)
            return res.send({data: []})
        } catch (error) {
            return res.status(400).send({error: 'Error de conexion.'})
        }
    },
    viewPost: async function(req, res){
        const {id} = req.params
        try {

            const result = await poolQuery.query(`Select * From post where id_user = ${id}`)

            if(!result[0]){
                return res.status(202).send({error: 'no hay información.'})    
            }

            return res.send({data: result})
        } catch (error) {
            return res.status(400).send({error: 'Error de conexion.'})
        }
    },
    detailPost: async function(req, res){
        const {id} = req.params
        try {

            const result = await poolQuery.query(`Select d.*, c.descripion typeDescription From post d, typepets c where c.id = d.type and d.id = ${id}`)

            if(!result[0]){
                return res.status(202).send({error: 'no hay información.'})    
            }

            let isValidImg = true
            if(!result[0].image){
                isValidImg = false
            }
            
            return res.send({data: {...result[0], image: 'data:image/jpg;base64,'+result[0].image, isValidImg}})
        } catch (error) {
            return res.status(400).send({error: 'Error de conexion.'})
        }
    },
    allPost: async function(req, res){
        const {id} = req.params
        try {

            const result = await poolQuery.query(`Select * From post where id_user <> ${id} and ind_adopt = 0`)

            if(!result[0]){
                return res.status(202).send({error: 'no hay información.'})    
            }

            return res.send({data: result})
        } catch (error) {
            return res.status(400).send({error: 'Error de conexion.'})
        }
    },
    updatePost: async function(req, res) {
        try {
            const {title, type, description, id} = req.body
            if(!title, !type || !description) {
                return res.status(202).send({error: 'Debe completar los datos.'})
            }

            await poolQuery.query(`
                UPDATE post Set title = '${title}', 
                                type = ${type}, 
                                description = '${description}'
                    Where id = ${id};
            `)
            return res.send({res: 'Publicación modificada.'})            

        } catch (error) {
            return res.status(400).send({error: 'Error de conexion.'})
        } 
    },
    updateAdopPost: async function(req, res) {
        try {
            const {id} = req.body
            if(!id) {
                return res.status(202).send({error: 'No es posible actualizar los datos.'})
            }

            await poolQuery.query(`UPDATE post Set ind_adopt = 1, date_adopt = NOW() Where id = ${id};`)
            return res.send({res: 'Adopción confirmada..'})            

        } catch (error) {
            return res.status(400).send({error: 'Error de conexion.'})
        }
    },
    insertTimeSearch: async function(req, res) {
        try {
            const {id_user, id_post, horaConsult, horaPublic, horaCreacion} = req.body
            if(!id_user && !id_post && !horaConsult && !horaPublic && !horaCreacion) {
                return res.status(202).send({error: 'insertTimeSearch'})
            }

            let mHoraConsult = moment(horaConsult)
            let mHoraPublic = moment(horaPublic)
            let mHoraCreacion = moment(horaCreacion)
            
            let timeTransConsult = mHoraPublic.diff(mHoraConsult, 'minutes')
            let timeTransCreacion = mHoraPublic.diff(mHoraCreacion, 'minutes')

            try {
                await poolQuery.query(`Insert into tiemp_busq(id_user, id_post, hora_consulta, hora_inic_busq, min_trans, fecha_Registro) 
                                        Values(${id_user}, ${id_post}, '${mHoraConsult.format('YYYY-MM-DD HH:mm')}', '${mHoraPublic.format('YYYY-MM-DD HH:mm')}', ${timeTransConsult}, now())`)
                
            } catch (error) {
                console.log('ERROR INSERT - insertTimeRequest - 1')
                console.log(error)
                return res.status(400).send({error: 'Error de conexion - insertar.'})
            }

            try {
                await poolQuery.query(`Insert into tiemp_resp(id_user, id_post, hora_consulta, hora_publicacion, min_trans, fecha_Registro) 
                                        Values(${id_user}, ${id_post}, '${mHoraConsult.format('YYYY-MM-DD HH:mm')}', '${mHoraCreacion.format('YYYY-MM-DD HH:mm')}', ${timeTransCreacion}, now())`)
            } catch (error) {
                console.log('ERROR INSERT - insertTimeRequest - 2')
                console.log(error)
                return res.status(400).send({error: 'Error de conexion - insertar.'})
            }

            return res.send({res: 'OK'})

        } catch (error) {
            return res.status(400).send({error: 'Error de conexion.'})
        }
    },
    insertTimeRequest: async function(req, res) {
        try {
            const {id_user, id_post, horaConsult, horaInicBusq} = req.body
            if(!id_user && !id_post && !horaConsult && !horaInicBusq) {
                return res.status(202).send({error: 'insertTimeRequest'})
            }

            
            let mHoraConsult = moment(horaConsult)
            let mHoraInicBusq = moment(horaInicBusq)
            let timeTrans = mHoraConsult.diff(mHoraInicBusq, 'hours')
            console.log(timeTrans)

            try {
                await poolQuery.query(`Insert into tiemp_resp(id_user, id_post, hora_consulta, hora_publicacion, hora_trans, fecha_Registro) 
                                        Values(${id_user}, ${id_post}, '${mHoraConsult.format('YYYY-MM-DD HH:mm')}', '${mHoraPublic.format('YYYY-MM-DD HH:mm')}', ${timeTrans}, now())`)
                return res.send({res: 'OK'})
            } catch (error) {
                console.log('ERROR INSERT - insertTimeSearch')
                console.log(error)
                return res.status(400).send({error: 'Error de conexion - insertar.'})
            }

        } catch (error) {
            return res.status(400).send({error: 'Error de conexion.'})
        }
    }
}

module.exports = controllerApp