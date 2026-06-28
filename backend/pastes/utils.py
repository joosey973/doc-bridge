from string import ascii_uppercase, ascii_lowercase
import itertools
import random

def generate_code():
    alphabet = ascii_lowercase + ascii_uppercase + ''.join([str(i) for i in range(10)])
    code = list(itertools.combinations(alphabet, 5))
    return ''.join(random.choice(code))

