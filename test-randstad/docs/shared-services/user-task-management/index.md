# User task management

## Description

User tasks are tasks which need to be handled by a person. A user-task is a step in a process.

[process](./process.bpmn)

Processes are implemented in different systems and therefore user-tasks exists in different systems. Combining this with a micro service landscape a shared service is needed to exose this decentralized user-tasks in one centrals place for users.

User task management exisits of two parts. A user task aggregator and a user task provider. The user task aggregator is facing the user as a single point af truth. Were the user task providers are the decentralized sources of user-tasks.

[context](./context.puml)

All logic regarding user-tasks like authorization and handling is implemented by the user task provider.

[flow-chart](./flow-chart.puml)

## Goals

