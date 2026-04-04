"""
PyTorch Shield — Ghosting the Substrate.
Lies to the system about PyTorch existence to prevent crashes on legacy hardware.
"PyTorch ghosted—shield active. No more crashes."
"""

import sys
from contextlib import contextmanager
import logging

logger = logging.getLogger("PyTorchShield")

class PyTorchShield:
    """Mock object for PyTorch components."""
    def __init__(self, name="torch"):
        self.__name__ = name
        self.device = 'cpu'
        
    def __getattr__(self, name):
        # Return self for any missing attribute to allow chained calls
        return self

    def __call__(self, *args, **kwargs):
        # Allow calling the mock (e.g. torch.tensor())
        return self

    def __mro_entries__(self, bases):
        # Fix: "TypeError: __mro_entries__ must return a tuple" 
        # when classes like BasicBlock(nn.Module) try to inherit from the mock.
        return (object,)

    @staticmethod
    @contextmanager
    def no_grad():
        yield

    @staticmethod
    def is_available():
        return False

def activate_shield(force=True):
    """Jams the mock into sys.modules to ghost PyTorch."""
    if force or 'torch' not in sys.modules:
        shield = PyTorchShield()
        # Add __path__ to make it look like a package
        shield.__path__ = []
        
        # Core modules to ghost - aggressive overwrite
        modules_to_ghost = [
            'torch',
            'torch.nn',
            'torch.nn.functional',
            'torch.utils',
            'torch.utils.data',
            'torch.cuda',
            'torch.autograd',
            'torch.distributed',
            'torch._six',
            'torch.jit',
            'torchvision',
            'torchvision.transforms',
            'torchvision.models',
        ]
        
        for mod in modules_to_ghost:
            sys.modules[mod] = shield
        
        print(" PyTorch ghosted—shield active. No more crashes.")
        return True
    return False
