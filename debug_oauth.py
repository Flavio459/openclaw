#!/usr/bin/env python3
"""
Debug do fluxo OAuth - Identifica erros passo a passo
"""

import requests
import json
import sys
from urllib.parse import urlparse, parse_qs

def test_redirect_uri():
    """Testa se a redirect_uri está configurada corretamente no Google Cloud"""
    print("🔍 Testando configuração OAuth...")
    print("=" * 50)
    
    client_id = "970434256582-1b7k31lsf92ujng89bbdiev35mgt307h.apps.googleusercontent.com"
    redirect_uri = "http://localhost:51121/oauth-callback"
    
    print(f"Client ID: {client_id}")
    print(f"Redirect URI: {redirect_uri}")
    print("\n⚠️  Verifique no Google Cloud Console:")
    print("1. Acesse: https://console.cloud.google.com/")
    print("2. Vá para: APIs & Services → Credentials")
    print("3. Encontre o OAuth 2.0 Client ID")
    print(f"4. Confirme que esta URI está cadastrada: {redirect_uri}")
    print("\n" + "=" * 50)
    return True

def test_local_server():
    """Testa se o servidor local está respondendo"""
    print("\n🌐 Testando servidor local...")
    try:
        response = requests.get("http://localhost:51121", timeout=5)
        print(f"✅ Servidor local responde: HTTP {response.status_code}")
        print(f"   Conteúdo: {response.text[:100]}...")
        return True
    except requests.ConnectionError:
        print("❌ Servidor local NÃO está respondendo")
        print("   Execute: python3 oauth_proxy.py")
        return False
    except Exception as e:
        print(f"❌ Erro ao testar servidor: {e}")
        return False

def test_oauth_endpoint():
    """Testa o endpoint OAuth do Google"""
    print("\n🔗 Testando endpoint OAuth do Google...")
    
    # URL simplificada para teste
    test_url = "https://accounts.google.com/.well-known/openid-configuration"
    
    try:
        response = requests.get(test_url, timeout=10)
        if response.status_code == 200:
            print("✅ Endpoint OAuth do Google está acessível")
            data = response.json()
            print(f"   Authorization endpoint: {data.get('authorization_endpoint', 'N/A')}")
            return True
        else:
            print(f"❌ Endpoint retornou HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro ao acessar endpoint: {e}")
        print("   Verifique conectividade com Google")
        return False

def simulate_oauth_flow():
    """Simula partes do fluxo OAuth para identificar problemas"""
    print("\n🔄 Simulando fluxo OAuth...")
    
    # Parâmetros da URL
    params = {
        'client_id': '970434256582-1b7k31lsf92ujng89bbdiev35mgt307h.apps.googleusercontent.com',
        'redirect_uri': 'http://localhost:51121/oauth-callback',
        'response_type': 'code',
        'scope': 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/cclog https://www.googleapis.com/auth/experimentsandconfigs',
        'access_type': 'offline',
        'prompt': 'consent'
    }
    
    print("📋 Parâmetros da requisição:")
    for key, value in params.items():
        if key == 'scope':
            scopes = value.split()
            print(f"   {key}:")
            for scope in scopes:
                print(f"     - {scope}")
        else:
            print(f"   {key}: {value}")
    
    print("\n⚠️  Problemas comuns:")
    print("1. Redirect URI não cadastrada no Google Cloud")
    print("2. Escopos muito amplos para conta gratuita")
    print("3. Client ID não autorizado para escopos solicitados")
    print("4. Conta Google não verificada/limitada")
    
    return True

def check_possible_solutions():
    """Sugere soluções baseadas em problemas comuns"""
    print("\n🔧 Soluções possíveis:")
    print("=" * 50)
    
    print("\n1. **Para conta gratuita (flavius9ia@gmail.com):**")
    print("   - Escopos podem ser muito amplos")
    print("   - Tente escopos mais básicos primeiro:")
    print("     'email profile openid'")
    
    print("\n2. **Redirect URI alternativa:**")
    print("   - Usar http://localhost:8080/oauth-callback")
    print("   - Mais comum em tutoriais OAuth")
    
    print("\n3. **Client ID alternativo:**")
    print("   - Criar novo Client ID no Google Cloud")
    print("   - Para 'Desktop application'")
    
    print("\n4. **Fluxo simplificado:**")
    print("   - Usar biblioteca google-auth-oauthlib")
    print("   - Fluxo local mais robusto")
    
    print("\n5. **Teste manual:**")
    print("   - Abra URL no navegador normal")
    print("   - Inspecione erros no Console (F12)")
    print("   - Capture mensagens de erro exatas")
    
    print("\n" + "=" * 50)

def main():
    print("🔍 DEBUG COMPLETO DO FLUXO OAUTH")
    print("=" * 60)
    
    # Executar testes
    test_redirect_uri()
    test_local_server()
    test_oauth_endpoint()
    simulate_oauth_flow()
    check_possible_solutions()
    
    print("\n🎯 RECOMENDAÇÃO IMEDIATA:")
    print("1. Crie novo Client ID no Google Cloud Console")
    print("2. Use escopos básicos: 'email profile openid'")
    print("3. Redirect URI: http://localhost:8080/oauth-callback")
    print("4. Teste fluxo simplificado primeiro")
    
    print("\n📝 Para ajuda específica:")
    print("   - Cole a mensagem de erro EXATA")
    print("   - Screenshot da tela de erro")
    print("   - URL completa com parâmetros de erro")

if __name__ == "__main__":
    main()