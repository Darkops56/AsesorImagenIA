const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey123';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { fullName, username, email, phone, password } = req.body;

    const userExists = await Usuario.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario o correo ya está en uso' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await Usuario.create({
      fullName,
      username,
      email,
      phone,
      password_hash
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        silueta_detectada: user.silueta_detectada,
        medidas_morfometricas: user.medidas_morfometricas,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Datos de usuario inválidos' });
    }
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error del servidor al registrar' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Usuario.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        silueta_detectada: user.silueta_detectada,
        medidas_morfometricas: user.medidas_morfometricas,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Correo o contraseña inválidos' });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor al iniciar sesión' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await Usuario.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.phone = req.body.phone || user.phone;
      // Note: we don't update email or password here

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        silueta_detectada: updatedUser.silueta_detectada,
        medidas_morfometricas: updatedUser.medidas_morfometricas,
        token: generateToken(updatedUser._id) // Opcional reenviar el token
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.updateSecurityInfo = async (req, res) => {
  try {
    const { currentPassword, newEmail, newPassword } = req.body;
    const user = await Usuario.findById(req.user._id);

    if (user && (await bcrypt.compare(currentPassword, user.password_hash))) {
      if (newEmail) {
        // Verificar que el nuevo email no exista
        const emailExists = await Usuario.findOne({ email: newEmail });
        if (emailExists && emailExists._id.toString() !== user._id.toString()) {
          return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
        }
        user.email = newEmail;
      }

      if (newPassword) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(newPassword, salt);
      }

      const updatedUser = await user.save();

      res.json({
        message: 'Información de seguridad actualizada correctamente',
        _id: updatedUser._id,
        email: updatedUser.email,
        token: generateToken(updatedUser._id) // Importante enviar nuevo token
      });
    } else {
      res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }
  } catch (error) {
    console.error('Error al actualizar seguridad:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
