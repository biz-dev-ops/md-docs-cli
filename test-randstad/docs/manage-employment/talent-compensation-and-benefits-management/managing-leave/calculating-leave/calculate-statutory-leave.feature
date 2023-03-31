Feature: Calculate statutory leave

  Background: 
    Given standard working week of "40" hours
    And statutory leave compensation per year is "4" times the standard working week
    And payrolling calendar year is "2022"
    And labor contract start date is "1-1-2022"
    And labor contract end date is "31-12-2022"
    And working hours is "40" hours per "week"

  Scenario: Calculating statutory leave for a contract
    When calculating leave
    Then calculated statutory leave is "160" hours

  Scenario: Calculating statutory leave for a contract with no end date
    And labor contract end date is ""
    When calculating leave
    Then calculated statutory leave is "160" hours

  Scenario: Calculating statutory leave for a contract with a start date before payrolling calendar year
    And labor contract start date is "1-1-2021"
    When calculating leave
    Then calculated statutory leave is "160" hours

  Scenario: Calculating statutory leave for a contract with a end date after payrolling calendar year
    And labor contract end date is "1-1-2023"
    When calculating leave
    Then calculated statutory leave is "160" hours

  Scenario: Calculating statutory leave for a contract which is not in scope of the payrolling calendar year
    And labor contract start date is "1-1-2021"
    And labor contract end date is "31-12-2021"
    When calculating leave
    Then calculated statutory leave is "0" hours

  Scenario: Calculating statutory leave for a contract contract for a partial year
    And labor contract start date is "15-3-2022"
    And labor contract end date is "11-7-2022"
    When calculating leave
    Then calculated statutory leave is "52.1643835616438" hours

  Scenario Outline: Calculating statutory leave for different working hours and periods
    And working hours is "<working hours>" hours per "<period>"
    When calculating leave
    Then calculated statutory leave is "<leave>" hours

    Examples: 
      | working hours | period          | leave            |
      |            40 | week            |              160 |
      |            20 | week            |               80 |
      |           100 | month           |  92.054794520548 |
      |           120 |         4 weeks |              120 |
      |           500 | contract period | 38.3561643835616 |
      |             4 | day             |              112 |
      |            50 | quarter         | 15.3424657534247 |
      |          1000 | year            | 76.7123287671233 |

  Scenario Outline: Calculating statutory leave for a min-max contract
    And working hours is min "<min>" and max "<max>" hours per "<period>"
    When calculating leave
    Then calculated statutory leave is "<leave>" hours

    Examples: 
      | min | max | period  | leave |
      |  20 |  40 | week    |    80 |
      |  80 | 160 | 4 weeks |    80 |
      |   0 |  40 | 4 weeks |     0 |

  Scenario: Calculating statutory leave for a different standard working week
    And standard working week of "38" hours
    And working hours is "38" hours per "week"
    When calculating leave
    Then calculated statutory leave is "152" hours

  Scenario: Calculating statutory leave for a different statutory leave compensation
    And statutory leave compensation per year is "8.5" times the standard working week
    When calculating leave
    Then calculated statutory leave is "340" hours

  Scenario: Calculating statutory leave for a contract with working hours greater than the standard working week
    And standard working week of "38" hours
    And working hours is "40" hours per "week"
    When calculating leave
    Then calculated statutory leave is "152" hours

  Scenario: Calculating statutory leave for a labor contract and period hours for hourly payrolling, declaration is lower than working hours
    And payrolling frequency is "weekly"
    And hours are "35" for period "52"
    When calculating leave
    Then calculated statutory leave is "159.616438356164" hours

  Scenario: Calculating statutory leave for a labor contract and period hours for contract payrolling, declaration is lower than working hour
    And payrolling frequency is "monthly"
    And hours are "152" for period "12"
    When calculating leave
    Then calculated statutory leave is "160" hours

  Scenario: Calculating statutory leave for a labor contract and period hours, declaration is greater than working hours and greater than standard working week
    And payrolling frequency is "monthly"
    And hours are "200" for period "1"
    When calculating leave
    Then calculated statutory leave is "160" hours

  Scenario: Calculating statutory leave for a labor contract and period hours, declaration is greater than working hours but lower than standard working week
    And working hours is "35" hours per "week"
    And payrolling frequency is "monthly"
    And hours are "165" for period "1"
    When calculating leave
    Then calculated statutory leave is "141.009870521096" hours

  Scenario: Calculating statutory leave for a labor contract with mutation in working hours and periods
    And labor contract mutation start date is "01-07-2022"
    And working hours is "<working hours>" hours per "<period>"
    When calculating leave
    Then calculated statutory leave is "<leave>" hours

    Examples: 
      | working hours | period  | leave            |
      |            35 | week    | 149.917808219178 |
      |           156 | month   |  151.73536498405 |
      |           120 | 4 weeks | 139.835616438356 |
      |             4 | day     | 135.802739726027 |
      |            60 | quarter | 148.951022705949 |

  Scenario: Calculating statutory leave for a labor contract for a partial year in a leap year as payrolling calendar year
    And payrolling calendar year is "2024"    
    And labor contract start date is "1-1-2024"    
    And labor contract end date is "30-06-2024"
    When calculating leave
    Then calculated statutory leave is "79.7808219178082" hours

  Scenario: Calculating statutory leave for a labor contract in a leap year as payrolling calendar year
    And payrolling calendar year is "2024"    
    And labor contract start date is "1-1-2024"    
    And labor contract end date is "31-12-2024"
    When calculating leave
    Then calculated statutory leave is "160" hours 
