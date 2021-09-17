Feature: Answering questions

    Scenario:
        Given an unclaimed review anwer task
        And I am the person who has created the answer
        When I claim the task
        Then I should recieve a forbidden response
        And the task should bot be claimed

    Scenario:
        Given a claimed review answer task
        And I am the person who has claimed the task
        When I delegate the task to the person who has created the answer
        Then I should recieve a forbidden response
        And the task should not be delegated