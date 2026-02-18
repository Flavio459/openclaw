#!/usr/bin/env python3
"""
Teste de configuração OAuth para Antigravity
"""

import socket
import time

def test_port(port=51121):
    """Testa se a porta está ouvindo"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        return result == 0
    except Exception as e:
        return False

def main():
    print("🔍 Testando configuração OAuth Antigravity")
    print("=" * 50)
    
    # Teste 1: Porta 51121
    print("\n1. Testando porta 51121...")
    if test_port(51121):
        print("   ✅ Porta 51121 está ouvindo")
    else:
        print("   ❌ Porta 51121 NÃO está ouvindo")
        print("   ℹ️  O plugin google-antigravity-auth pode não estar iniciado")
    
    # Teste 2: Verificar configuração
    print("\n2. Verificando configuração...")
    print("   Client ID: 970434256582-1b7k31lsf92ujng89bbdiev35mgt307h.apps.googleusercontent.com")
    print("   Redirect URI: http://localhost:51121/oauth-callback")
    print("   Conta: flavius9ia@gmail.com (ambiente Flavius)")
    
    # Teste 3: Sugestões
    print("\n3. Próximos passos:")
    print("   a) Verificar logs do gateway: journalctl -u openclaw-gateway")
    print("   b) Confirmar plugin habilitado: plugins.entries.google-antigravity-auth.enabled = true")
    print("   c) Reiniciar gateway: openclaw gateway restart")
    print("   d) Testar manualmente: curl -v http://localhost:51121")
    
    print("\n" + "=" * 50)

if __name__ == "__main__":
    main()