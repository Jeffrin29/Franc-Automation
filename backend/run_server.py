# =======================================================================
# Franc Automation — Clean Eventlet Launch Entrypoint
# =======================================================================
# This ensures eventlet.monkey_patch() runs before Flask or SocketIO
# are imported anywhere. It completely prevents "Working outside of
# application context" and "RLock(s) not greened" warnings.
# =======================================================================

import eventlet
eventlet.monkey_patch(all=True)

import os
import eventlet.wsgi
from backend.app import create_app
from backend.utils.audit import log_info

app = create_app()

if __name__ == "__main__":
    log_info("🚀 Franc Automation starting with safe eventlet patching...")
    eventlet.wsgi.server(
        eventlet.listen(("0.0.0.0", int(os.environ.get("PORT", 5000)))),
        app,
    )
