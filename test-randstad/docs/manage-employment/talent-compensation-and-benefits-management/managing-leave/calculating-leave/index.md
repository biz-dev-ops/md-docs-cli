# Calculating leave

## Description

* [API](./product.openapi.yml)

## Use-cases

### Calculate statutory leave

> 4 x full-time working hours per week (standard working week) of the terms of employment scheme on annual basis.

* For all hours above the standard work week of the labor contract, the employee is **not** entitled to statutory leave.
* All declared hours between the working hours of the terms of employment scheme and standard working week of the labor contract are eligible for statutory leave.
* Future leave entitlement must be assigned for the duration of the labor contract and no later than the end of the calendar year.
* The calculation of future leave entitlement must always be based on standard working week and in case of min-max on the basis of the minimum working hours in the labor contract.
* Future leave entitlement must be granted in hours.
* Future leave entitlement must be calculated for both contract payrolling and hourly payrolling.
* These scenarios are only applicable for fiscal year which are equal to calendar years.

[Requirements](./calculate-statutory-leave.feature)


## Requirements

* Days in year are 365, also for leap years.
* Converting time periods to week:
  * per month = (working hours * 12 months / 365 days) * 7 days
  * per 4 weeks = (working hours / 28 days) * 7 days
  * per contract period = (working hours / number of days of contract period) * 7 days
  * per year = (working hours / 365 days) * 7 days
  * per day = working hours * 7 days
  * per quarter = (working hours * 4 quarters / 365 days) * 7 days



