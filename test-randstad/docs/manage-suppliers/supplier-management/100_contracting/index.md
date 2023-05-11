# Contracting supplier

## Description

Contracting supplier starts when a supplier is found who can fullfil a client order which has been approved by the client. A purchase contract is created when the supplier is contracted and a purchase order is created when the talent is contracted. This will lead to an assignment linking the client order and the purchase order which is created and executed in the execute assignment value stream.

@Jonne, zou je hier de volgende zaken kunnen toevoegen:

* Omschrijving?
* Doelen?
* Hoe worden doelen meetbaar gemaakt?

De doelen moeten sturend zijn voor de requirements en implementatie. Ik hoor nu veel aannames op het gebied van security, gebruiksvriendelijkheid en efficiency die ik nergens aan kan relateren.

<!-- end -->

* [Interface](product.user-task.yml)
* [API](product.openapi.yml)

## Process

[Process](./process.bpmn)

## Use-cases

### Send invitation

* [Message (nl)](./invitation-nl.email.md)
* [Message (en)](./invitation-en.email.md)
* [Attachment (nl)](./purchase-order-nl.message.md)
* [Attachment (nl)](./purchase-order-en.message.md)

### Invitation accepted

The supplier has two options after navigating to link from the invitation message:

1. Sign in with the email addres to which the invitation was sent when the account already exists;
1. Create a new account with the email address to which the invitation was sent;

Both use-cases are default IAM use-cases and need to be implemented by the IAM business capability.

After succesfully completing one of the use-cases the user will be forwarded to the supplier-management domain. In this domain the principal email address will be used to find an active contracting process instance. When found the invitation accepted message will be correlated in the active process instance. Next, the supplier is forwarded to the contracting page where further processing takes place.

* [Sequence diagram](./invitation-accepted.puml)

### Preview purchase contract & order details

Once the supplier is forwarded to the contracting page they want to review the order details. They are also able to preview the concept purchase contract. As a supplier I want to preview the following order details;

1. @Jonne
1.
1. 

### Screening supplier

[See screening process for more information.](./screening/index.md)

### Create purchase order

* [Document (nl)](./purchase-order-nl.message.md)
* [Document (en)](./purchase-order-en.message.md)

### Sign purchase order

* [Interface](./sign-purchase-order.user-task.yml)
* [API](./sign-purchase-order.openapi.yml)
* [Document (nl)](./purchase-order-nl.message.md)
* [Document (en)](./purchase-order-en.message.md)

### Send purchase order

* [Message (nl)](./purchase-order-nl.email.md)
* [Message (en)](./purchase-order-en.email.md)
* [Attachment (nl)](./purchase-order-nl.message.md)
* [Attachment (en)](./purchase-order-en.message.md)

### Send contracted confirmation

* [Message (nl)](./contracted-confirmation-nl.email.md)
* [Message (en)](./contracted-confirmation-en.email.md)

### Contracted

* Vraag: welke informatie heeft Mondriaan nodig?

### Send invitation reminder

* [Message (nl)](./invitation-reminder-nl.email.md)
* [Message (en)](./invitation-reminder-en.email.md)

### Send sign purchase order reminder

* [Message (nl)](./sign-purchase-order-reminder-nl.email.md)
* [Message (en)](./sign-purchase-order-reminder-en.email.md)

### Reject supplier

* [Interface](./reject-supplier.user-task.yml)
* [API](./reject-supplier.openapi.yml)

### Send rejection

* [Message (nl)](./rejection-nl.email.md)
* [Message (en)](./rejection-en.email.md)

## Requirements

Wat zijn de requirements (functional & non-functional)?

| Nummer    | Eigenaar                  | Omschrijving                                                          | Waarde    | Investering   |
| -         | -                         | -                                                                     | -         | -             |
| 1         | Van wie is de requirement | Omschrijving van requirement (eventueel met link naar een pagina)     | L         | S             |
| 2         | Annet                     | In eerste e-mail ontvangt supplier concept-opdrachtovereenkomst       |           |               |
| 3         |                           |                                                                       |           |               |
| 4         |                           |                                                                       |           |               |
| 5         |                           |                                                                       |           |               |

## Questions / subjects for research/refinement

* Wat is de output van dit proces? (@David) Supplier is gecontracteerd, juridische basis voor de samenwerking is totstandgekomen.
* Wat is de context van dit proces? (@David) Wat bedoel je precies met de context? Waar ben je naar op zoek?
* Wat is de contract-tekst? (@David) https://docs.google.com/document/d/1xpkw4q47ox-_Oz1j_fkP-AGPDHcEnuHwOaESz9ORjEc/edit?usp=drive_web
* Hoe documenten genereren? (@Hans --> document management)
* Hoe documenten opslaan? (@Alfred --> document management)
* Hoe email berichten versturen? (@Arjan --> architectuur overleg)
* Wat zijn de verschillen met doorlenen? (@David)
* Hoe lang moet ID nog geldig zijn bij opgave IDnummer + expiration tijdens uitvraag ZZP'er? (@...)
* ID-check gebeurt op rechtsgeldige vertegenwoordiger bedrijf. Hoe gaan we om met potentieel verschil t.o.v. persoon die de opdracht daadwerkelijk uitvoert? Moeten we een optionele uitvraag toevoegen? (@...)
*  Concrete requirements op veldniveau van uitvraag consultant/ZZP'er: maximaal togestane lengte invoer, etc. (@...)
*  Moet bestandsupload voor polis BAV meer dan 1 file toestaan?
*  Wat uit deze lijst: https://docs.google.com/spreadsheets/d/15XPv2W5ThlRLakN-Ej4GfVEtl4X5UetSLrVu6Hna_pw/edit#gid=2069695917 moet er precies ten minimale terechtkomen in de eerste versie van de consultant-uitvraag? (@...)