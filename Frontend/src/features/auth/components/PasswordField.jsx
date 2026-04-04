import { useState} from 'react'

const PasswordField = ({onChange}) => {
    const [password , showPassword] = useState(false);
  return (
    <div className="password-field">
        <input required onChange={onChange} label="Password" name="password" type={password ? "text" : "password"} placeholder="Enter your password" />
        <button type="button" onClick={() => showPassword(!password)}>{password ? "Hide" : "Show"}</button>
    </div>
  )
}

export default PasswordField