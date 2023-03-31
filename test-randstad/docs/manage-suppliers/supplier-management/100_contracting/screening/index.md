# Screening supplier

## Description

This business process is to ensure that our suppliers meet certain standards as per all relevant legislation, regulation, and Randstad business principles and policies. For this purpose certain information and informations are retrieved from the supplier. These items have to meet certain criteria before contract fulfillment may begin.

## Goals

* Compliance
* Lowering operational costs by reducing manual screening processes
* Maximize supplier satisfaction by providing them with easy to use tooling for providing the screening information needed.

* Hoe worden doelen meetbaar gemaakt? @Mignon, Annet: kunnen we hier iets op roepen?

## Process

* @Jonne, met welke doelen wordt deze informatie verzameld? Is het doel breder dan tot goedkeuring te komen?

[process](./process.bpmn)

## Use-cases

### Submit information

* [Interface](./submit-information.user-task.yml)
* [API](./submit-information.openapi.yml)

### Approve information automatically

@Jonne: deze use-case moet voor de POC beschreven worden. Welke informationen zouden op basis waarop beoordeeld moeten worden?

### Determine approval necessary

Todo: create DMN file and present it (BPMN.io?)

### Approve information

* [Interface](./approve-information.user-task.yml)
* [API](./approve-information.openapi.yml)

### Send notification

* [Message (nl)](./notification-nl.email.md)
* [Message (en)](./notification-en.email.md)

## Requirements

| Nummer    | Eigenaar                  | Omschrijving                                                          | Waarde    | Investering   |
| -         | -                         | -                                                                     | -         | -             |
| 1         | Van wie is de requirement | Omschrijving van requirement (eventueel met link naar een pagina)     | L         | S             |
