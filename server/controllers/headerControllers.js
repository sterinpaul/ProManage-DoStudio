import Joi from "joi"
import headerHelpers from "../helpers/headerHelpers.js"
import taskHelpers from "../helpers/taskHelpers.js"


const headerControllers = () => {

    const addHeader = async (req, res) => {
        try {
            const headerSchema = Joi.object({
                name: Joi.string()
                    .min(1)
                    .max(20)
                    .pattern(/^(?!.*  )[A-Za-z]+(?: [A-Za-z]+)*$/)
                    .required()
            })
            const { error, value } = headerSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            value.name = value.name.toLowerCase()
            const headerExists = await headerHelpers.findHeaderByName(value.name)
            if (headerExists) {
                return res.status(200).json({ status: false, message: "Header already exists" })
            }
            const key = value.name.split(" ").map((word, index) => {
                if (index === 0) {
                    return word
                }
                return word.charAt(0).toUpperCase() + word.slice(1)
            }).join("")

            const headerCount = await headerHelpers.findHeadersCount()

            const headerResponse = await headerHelpers.addHeader({ name: value.name, key, order: headerCount + 1 })

            if (headerResponse) {
                try{
                    const headerUpdation = await taskHelpers.addHeaderToTask(headerResponse)
                    if (headerUpdation.modifiedCount) {
                        return res.status(200).json({ status: true, message: "Header added", data: headerResponse })
                    }
                }catch(error){
                    await headerHelpers.removeHeader(headerResponse._id)
                    return res.status(200).json({ status: false, message: "Internal error" })
                }
            }

            return res.status(200).json({ status: false, message: "Error adding header" })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }


    return {
        addHeader
    }
}

export default headerControllers;