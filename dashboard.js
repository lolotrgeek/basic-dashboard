const { Node } = require("basic")

const node = new Node("dashboard")

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
    console.table(node.core.getPeers())
    // console.table(node.core.getGroups())
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
    if(logs.length === 0) {node.join('log')}
    if(!next_items) node.join('nexts')
    if(next_item.waiting) node.join('next')
    if(current_calls === 0) node.join('calls')
    await updateDashboard()
    node.send("dashboard", "Hello!")
    return setTimeout(runDashboard, 2000)
}

runDashboard()

module.exports = { Dashboard, updateDashboard, runDashboard }