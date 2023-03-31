# Extending contract

## Description

@Jonne, zou je hier de volgende zaken kunnen toevoegen:

* Omschrijving?
* Doelen?
* Hoe worden doelen meetbaar gemaakt?

De doelen moeten sturend zijn voor de requirements en implementatie. Ik hoor nu veel aannames op het gebied van security, gebruiksvriendelijkheid en efficiency die ik nergens aan kan relateren.

<!-- end -->

## Process

[Process](./process.bpmn)

## Use-cases

### Assess purchase order

* [Interface](./assess-purchase-order.user-task.yml)
* [API](./assess-purchase-order.openapi.yml)

### Determine documents expired

Filter all documents which are used for the current contract with an expiry date and which are expired.

### Screening

[See screening process for more information.](../100_contracting/screening/index.md)

### Create purchase order

* [Document (nl)](../100_contracting/purchase-order-nl.message.md)
* [Document (en)](../100_contracting/purchase-order-en.message.md)

### Sign purchase order

* [Interface](../100_contracting/sign-purchase-order.user-task.yml)
* [API](../100_contracting/sign-purchase-order.openapi.yml)
* [Document (nl)](../100_contracting/purchase-order-nl.message.md)
* [Document (en)](../100_contracting/purchase-order-en.message.md)

### Send purchase order

* [Message (nl)](../100_contracting/purchase-order-nl.email.md)
* [Message (en)](../100_contracting/purchase-order-en.email.md)
* [Contract (nl)](../100_contracting/purchase-order-nl.message.md)
* [Contract (en)](../100_contracting/purchase-order-en.message.md)

### Purchase order extended

* Vraag: welke informatie heeft Mondriaan nodig?

### Reject supplier

* [Interface](../100_contracting/reject-supplier.user-task.yml)
* [API](../100_contracting/reject-supplier.openapi.yml)

### Send purhase order ended message

* [Message (nl)](./purchase-order-ended-nl.email.md)
* [Message (en)](./purchase-order-ended-en.email.md)

## Requirements

Wat zijn de requirements (functional & non-functional)?

| Nummer    | Eigenaar                  | Omschrijving                                                          | Waarde    | Investering   |
| -         | -                         | -                                                                     | -         | -             |
| 1         | Van wie is de requirement | Omschrijving van requirement (eventueel met link naar een pagina)     | L         | S             |