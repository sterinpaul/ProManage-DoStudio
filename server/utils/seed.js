import headerHelpers from "../helpers/headerHelpers.js";
import priorityHelpers from "../helpers/priorityHelpers.js";
import statusHelpers from "../helpers/statusHelpers.js";


export const seedInitialData = async()=>{
    try {
        const existance = await Promise.all([
            headerHelpers.findHeadersCount(),
            statusHelpers.findStatusCount(),
            priorityHelpers.findPriorityCount()
        ])
        const isExists = existance.every(singleResponse=>singleResponse > 0)
        if(isExists){
            console.log("initial seeding already done");
        }else{
            const defaultHeaders = [
                {
                    name:"task",
                    key:"task",
                    order:1
                },
                {
                    name:"status",
                    key:"status",
                    order:2
                },
                {
                    name:"due date",
                    key:"dueDate",
                    order:3
                },
                {
                    name:"priority",
                    key:"priority",
                    order:4
                },
                {
                    name:"notes",
                    key:"notes",
                    order:5
                },
                {
                    name:"people",
                    key:"people",
                    order:6
                }
            ]
            const seedResponse = await Promise.all([
                headerHelpers.seedAllHeaders(defaultHeaders),
                statusHelpers.addOption({option:"not started",color:"#797171"}),
                priorityHelpers.addOption({option:"normal",color:"#3c53ec"})
            ])
            
            if(seedResponse.length){
                console.log("Seeding success");
            }
        }
    } catch (error) {
        console.error(`Error seeding initial data: ${error}`);
    }
}