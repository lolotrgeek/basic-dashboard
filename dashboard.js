const { Node } = require("basic-messaging")

const node = new Node("trader-dashboard")

let alive = false
let logs = []
let next_item = { waiting: "signal..." }
let next_items
let current_calls = 0

const parse = msg => {
    try {
        return JSON.parse(msg)
    } catch (error) {
        return msg
    }
}

node.listen("alive", msg => alive = msg)
node.listen("log", msg => logs.push(parse(msg)))
node.listen("next", next => next_item = next)
node.listen("nexts", nexts => next_items = nexts)
node.listen("calls", calls => current_calls = calls )


function filter_order(order) {
    if (!order) return {}
    filtered_order = {}
    filtered_order.time = new Date(order.time).toLocaleString()
    filtered_order.orderId = order.orderId
    filtered_order.clientOrderId = order.clientOrderId
    filtered_order.symbol = order.symbol
    filtered_order.side = order.side
    filtered_order.price = order.price
    filtered_order.status = `${order.status}: ${order.executedQty}/${order.origQty}`
    return filtered_order
}

function Dashboard(calls, count, nexts, current, logs) {
    console.clear()
    // console.table(node.channels)
    console.log("Alive:", alive, "Calls:", calls, "| Current Count:", count)
    if (typeof current === 'object' && current.order) current = filter_order(current.order)
    console.table(current)
    console.log("Nexts:")
    console.table(nexts)
    console.log("Logs:")
    console.table(logs.slice(-10))
}

function updateDashboard() {
    let calls = `${current_calls}`
    // let current = typeof next_item === 'object' ? next_item : { waiting: "signal..." }
    let current = next_item
    let count = typeof next_item === 'object' && next_item.count ? next_item.count : 0
    let nexts = Array.isArray(next_items) ? next_items : [{ waiting: "signal..." }]
    Dashboard(calls, count, nexts, current, logs)
}

async function runDashboard() {
    await updateDashboard()
    return setTimeout(runDashboard, 2000)
}

runDashboard()

module.exports = { Dashboard, updateDashboard, runDashboard }