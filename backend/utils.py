import string
import random

def generate_unique_code(k=5):
    code = ''.join(random.choices(string.ascii_letters + string.digits, k=k))
    return code