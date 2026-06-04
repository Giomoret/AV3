import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { type Peca, type Etapa, type Aeronave } from './types';
import { useAuth } from './AuthContext';
import './css/Dashboard.css';
import { Plane, Settings, Factory, Microscope, BarChart3, Users } from 'lucide-react';

const menuItems = [
    { to: "aeronaves", label: "Aeronaves", icon: <Plane size={20} /> },
    { to: "pecas", label: "Peças", icon: <Settings size={20} /> },
    { to: "etapas", label: "Etapas de Produção", icon: <Factory size={20} /> },
    { to: "testes", label: "Controle de Testes", icon: <Microscope size={20} /> },
    { to: "relatorios", label: "Relatórios", icon: <BarChart3 size={20} /> },
    { to: "funcionarios", label: "Funcionários", icon: <Users size={20} /> },
];
function Dashboard() {
    const { logout, user } = useAuth();
    const [pecas, setPecas] = useState<Peca[]>([]);
    const [etapas, setEtapas] = useState<Etapa[]>([]);
    const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);

    const nomeCurto = user?.funcionario?.nome.split(' ')[0] || 'Usuário';
    const cargo = user?.funcionario?.cargo || 'Indefinido';

    return (
        <div className="dashboard-container">

            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2 className="sidebar-title">AEROCODE</h2>
                </div>
                <nav>
                    <ul>
                        {menuItems.map(item => (
                            <li key={item.to}>
                                <NavLink
                                    to={`/dashboard/${item.to}`}
                                >
                                    <span className="menu-icon">{item.icon}</span>
                                    <span className="menu-text">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <p className="font-semibold text-white">Bem-vindo(a), {nomeCurto}</p>

                        {/* Só exibe o cargo se ele for diferente do nome */}
                        {nomeCurto !== cargo && (
                            <p className="text-sm text-gray-400">{cargo}</p>
                        )}
                    </div>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            logout();
                            localStorage.clear();
                        }}
                        className="btn-danger mt-4 w-full"
                        title="Sair do sistema"
                    >
                        Sair
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet
                    context={{ pecas, setPecas, etapas, setEtapas, aeronaves, setAeronaves }}
                />
            </main>
        </div>
    );
}

export default Dashboard;