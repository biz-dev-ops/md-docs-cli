# My tasks

## Description

My tasks acts as an aggregator. It asks, on behalve of a user, every my tasks provider to return a maximum of tasks.
The my tasks provider returns user tasks which are claimed by the user or unclaimed user tasks which can be claimed by the user (= is authorized to claim).
All the responses are aggregated into one collection containing a maximum of user tasks ordered by an algorithm.

My tasks is a stateless aggregator and it depends on decentralized state provided by the my tasks providers. Alle logic related to user task (priority, authorization and handling) is implemented by the my tasks provider decentrally as part of a business capabillity.

* [API](product.openapi.yml)

## Context

* [context](../context.puml)
* [flow-chart](../flow-chart.puml)

The service registry pattern is used to discover user my tasks provider instances.

When a user has claimed a user task the user must complete, delegate or delay the task before claiming a new user task. This prevents cherry-picking.

## Order algorithm

The user tasks are ordered by urgency. The urgency is based on the following criteria:

* When is the user task created?
* What is the user task due date?
* What is the priority of the user task?