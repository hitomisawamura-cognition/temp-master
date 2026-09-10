interface NavbarProps {
  connected: boolean
}

export function Navbar({ connected }: NavbarProps) {
  return (
    <nav className="navbar navbar-default navbar-fixed-top">
      <div className="container-fluid">
        <div className="navbar-header">
          <a className="navbar-brand" href="#">Temp Master Dashboard</a>
        </div>
        <ul className="nav navbar-nav">
          <li className="active"><a href="/">Dashboard</a></li>
        </ul>
        <div className="navbar-status pull-right">
          <span className={`label ${connected ? 'label-success' : 'label-danger'}`}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </nav>
  )
}
