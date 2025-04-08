To open claude with devtools:
`open -a Claude --args --remote-debugging-port=9222 --remote-allow-origins='http://localhost:9222'`
then open chrome to http://localhost:9222

To make Claude try and reconnect to the server if it failed (from dev tools):
`await claudeAppBindings.connectToMcpServer("discover")`
