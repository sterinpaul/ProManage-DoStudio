import Counters from "../models/counters.js";

export const getNextSequence = async(incrementCount=1) => {
    var ret = await Counters.findOneAndUpdate(
            {_id:1},{ $inc: { seq: incrementCount } },
            {new: true, upsert: true}
    );
    return ret.seq
}