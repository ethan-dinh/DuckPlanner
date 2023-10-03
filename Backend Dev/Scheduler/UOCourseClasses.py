"""
Title: UO Schedule Web Scraper
Author: Ethan Dinh
Date: 9/28/2023
"""

class Course:
    """ Class to represent a course """
    def __init__(self, name: str, description: str, credits: float):
        self.name = name
        self.description = description
        self.credits = credits
        self.sections = []