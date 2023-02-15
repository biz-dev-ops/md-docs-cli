Feature: Guess the word lorem and ipsum

  Background:
    Given a global administrator named "lorem"
    And a blog named "Greg's anti-tax rants"
    And a customer named "Dr. Bill lorem"
    And a blog named "Expensive Therapy" owned by "Dr. Bill ipsum"
  #{{#items}}
  
  Scenario: Maker starts a game ipsum {{name}}
    When the Maker starts a game
    Then the Maker waits for a Breaker to join

  Scenario Outline: eating
    Given there are <start> cucumbers
    When I eat <eat> cucumbers
    Then I should have <left> cucumbers

    Examples:
    | start | eat | left |
    |    12 |   5 |    7 |
    |    20 |   5 |   15 |
  #{{/items}}