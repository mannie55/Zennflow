import axios from 'axios'
const baseUrl = 'http://localhost:3000/sessions'


const create = async (newSessionObject) => {
    const response = await axios.post(baseUrl, newSessionObject)
    return response.data
}

export default create