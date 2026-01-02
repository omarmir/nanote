const envSecretKey = process.env.SECRET_KEY

const SECRET_KEY = envSecretKey ?? 'nanote'

export default SECRET_KEY
