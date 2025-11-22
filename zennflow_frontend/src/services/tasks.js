import axios from 'axios'
const baseUrl = 'http://localhost:3000/tasks'



const getAll = async () => {
    const response = await axios.get(baseUrl)
    return response.data

}

const create = async (newTaskObject) => {
    const response = await axios.post(baseUrl, newTaskObject)
    return response.data
}

const remove = async (object) => {
    const response = await axios.delete(`${baseUrl}/${object.id}`)

    return response.data
}

const update = async (object) => {
    const response = await axios.put(`${baseUrl}/${object.id}`, object)
    return response.data
}

export default { getAll, create, remove, update }