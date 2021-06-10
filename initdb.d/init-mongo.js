/* eslint-disable no-undef */

print('START #################################################################');

db.createUser({
    user: 'ack',
    pwd: 'ack123',
    roles: [
      {
        role: 'readWrite',
        db: 'ack'
      }
    ]
})

print('END #################################################################');
