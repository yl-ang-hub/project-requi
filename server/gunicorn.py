# The socket to bind to
bind = "0.0.0.0:8000"

# Is a number of OS processes for handling requests
workers = 4

# Is a maximum count of active greenlets grouped in a pool that will be
# allowed in each process
worker_connections = 1000

# The maximum number of requests a worker will process before restarting
max_requests = 5000

# Workers silent for more than this many seconds are killed and restarted
timeout = 120

# The access log file to write to, "-" means to stderr
accesslog = "-"

# The error log file to write to, "-" means to stderr
errorlog = "-"