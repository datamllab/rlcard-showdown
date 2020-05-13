import rlcard
from .leduc_holdem_random_model import LeducHoldemRandomModelSpec
from .doudizhu_random_model import DoudizhuRandomModelSpec


# Register Leduc Holdem Random Model
rlcard.models.registration.model_registry.model_specs['leduc-holdem-random'] = LeducHoldemRandomModelSpec()

# Register Doudizhu Random Model
rlcard.models.registration.model_registry.model_specs['doudizhu-random'] = DoudizhuRandomModelSpec()

# The models we are concerned
MODEL_IDS = {}
MODEL_IDS['leduc-holdem'] = [
        'leduc-holdem-random',
        'leduc-holdem-cfr',
        'leduc-holdem-rule-v1',
        ]

MODEL_IDS['doudizhu'] = [
        'doudizhu-random',
        'doudizhu-rule-v1',
        ]



