import rlcard
from .leduc_holdem_random_model import LeducHoldemRandomModelSpec


# Register Leduc Holdem Random Model
rlcard.models.registration.model_registry.model_specs['leduc-holdem-random'] = LeducHoldemRandomModelSpec()

# The models we are concerned
MODEL_IDS = {}
MODEL_IDS['leduc-holdem'] = [
        'leduc-holdem-random',
        'leduc-holdem-cfr',
        'leduc-holdem-rule-v1',
        ]

