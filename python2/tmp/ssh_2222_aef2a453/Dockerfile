FROM ubuntu:20.04

    ENV DEBIAN_FRONTEND=noninteractive
    RUN apt-get update && apt-get install -y openssh-server sudo && \
        mkdir /var/run/sshd && mkdir -p /var/log/ssh && echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config && \
        echo 'LogLevel VERBOSE' >> /etc/ssh/sshd_config

    RUN useradd -m attacker && echo 'attacker:123456' | chpasswd && mkdir -p /home/attacker/.ssh && chmod 700 /home/attacker/.ssh
RUN useradd -m admin && echo 'admin:admin123' | chpasswd && mkdir -p /home/admin/.ssh && chmod 700 /home/admin/.ssh
RUN useradd -m guest && echo 'guest:guestpass' | chpasswd && mkdir -p /home/guest/.ssh && chmod 700 /home/guest/.ssh


    EXPOSE 22
    CMD ["/usr/sbin/sshd", "-D"]
