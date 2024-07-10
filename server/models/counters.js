import { model, Schema } from "mongoose";

const counterSchema = new Schema (
    {
        _id:{
            type: String,
            default:0
        },
        seq:{
            type: Number,
            required: true
        }
    }
)

const Counters = model('counters', counterSchema);
export default Counters
