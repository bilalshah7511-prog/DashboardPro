export const getUsers = () => {
  const users = localStorage.getItem('users')
  return users ? JSON.parse(users) : []
}

export const saveUsers = (users) => {
  localStorage.setItem('users', JSON.stringify(users))
}

export const addUser = (user) => {
  const users = getUsers()
  const userExists = users.find(u => u.email === user.email)

  if (userExists) {
    return { success: false, message: 'Email already exists' }
  }

  const newUser = {
    id: Date.now().toString(),
    ...user,
    role: user.email === 'admin@gmail.com' ? 'admin' : 'user',
    createdAt: new Date().toISOString(),
    profileImage: user.profileImage || null,
    gender: user.gender || 'Not specified'
  }

  users.push(newUser)
  saveUsers(users)
  return { success: true, user: newUser }
}

export const updateUser = (id, updatedData) => {
  const users = getUsers()
  const index = users.findIndex(u => u.id === id)

  if (index !== -1) {
    users[index] = { ...users[index], ...updatedData }
    saveUsers(users)

    const currentUser = getCurrentUser()
    if (currentUser && currentUser.id === id) {
      setCurrentUser(users[index])
    }

    return { success: true, user: users[index] }
  }

  return { success: false, message: 'User not found' }
}

export const deleteUser = (id) => {
  const users = getUsers()
  const filteredUsers = users.filter(u => u.id !== id)
  saveUsers(filteredUsers)
  return { success: true }
}

export const authenticateUser = (email, password) => {
  const users = getUsers()
  const user = users.find(u => u.email === email && u.password === password)

  if (user) {
    return { success: true, user }
  }

  return { success: false, message: 'Invalid email or password' }
}

export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser')
  return user ? JSON.parse(user) : null
}

export const setCurrentUser = (user) => {
  localStorage.setItem('currentUser', JSON.stringify(user))
}

export const logout = () => {
  localStorage.removeItem('currentUser')
}

export const addLoginRecord = (userId) => {
  const users = getUsers()
  const user = users.find(u => u.id === userId)

  // Don't track login for the main owner admin (admin@gmail.com)
  if (user && user.email === 'admin@gmail.com') {
    return
  }

  const logins = getLoginRecords()
  const loginRecord = {
    id: Date.now().toString(),
    userId,
    timestamp: new Date().toISOString()
  }

  logins.push(loginRecord)
  localStorage.setItem('loginRecords', JSON.stringify(logins))
}

export const getLoginRecords = () => {
  const records = localStorage.getItem('loginRecords')
  return records ? JSON.parse(records) : []
}

export const getUserLoginRecords = (userId) => {
  const records = getLoginRecords()
  return records.filter(r => r.userId === userId)
}

export const initializeAdmin = () => {
  const users = getUsers()
  const adminExists = users.find(u => u.email === 'admin@gmail.com')

  if (!adminExists) {
    addUser({
      email: 'admin@gmail.com',
      password: 'admin',
      name: 'Admin',
      gender: 'Male'
    })
  }
}
