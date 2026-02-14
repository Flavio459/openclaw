#!/usr/bin/env python3
"""
Servidor OAuth super simples - apenas captura código e mostra
"""

import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
import sys

PORT = 51121

class SimpleOAuthHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        print(f"\n📥 Recebida requisição: {self.path}")
        
        parsed = urlparse(self.path)
        
        if parsed.path == '/oauth-callback':
            query = parse_qs(parsed.query)
            
            if 'code' in query:
                code = query['code'][0]
                print(f"\n🎉 🎉 🎉 CÓDIGO OAUTH CAPTURADO 🎉 🎉 🎉")
                print(f"\n📋 CÓDIGO: {code}")
                print(f"\n📝 Copie este código e cole no chat!")
                
                # Responder
                self.send_response(200)
                self.send_header('Content-type', 'text/html; charset=utf-8')
                self.end_headers()
                html = f"""
                <html><body style="font-family: Arial; padding: 20px;">
                <h2>✅ Autenticação Bem-sucedida!</h2>
                <p>Código OAuth recebido com sucesso.</p>
                <p>Volte ao chat e cole o código.</p>
                <p><small>Código: {code[:50]}...</small></p>
                </body></html>
                """
                self.wfile.write(html.encode())
                
                # Salvar código
                with open('/tmp/oauth_code.txt', 'w') as f:
                    f.write(code)
                
                print(f"\n💾 Código salvo em: /tmp/oauth_code.txt")
                print("🛑 Servidor continuará rodando para outras autenticações")
                
            elif 'error' in query:
                error = query['error'][0]
                error_desc = query.get('error_description', [''])[0]
                print(f"\n❌ ERRO DO GOOGLE: {error}")
                print(f"📝 Descrição: {error_desc}")
                
                self.send_response(400)
                self.send_header('Content-type', 'text/html; charset=utf-8')
                self.end_headers()
                html = f"""
                <html><body style="font-family: Arial; padding: 20px; color: red;">
                <h2>❌ Erro de Autenticação</h2>
                <p>Erro: {error}</p>
                <p>{error_desc}</p>
                </body></html>
                """
                self.wfile.write(html.encode())
                
            else:
                print(f"\n⚠️  Requisição sem código ou erro: {query}")
                self.send_response(400)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(b"<h1>Parametros invalidos</h1>")
                
        elif parsed.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"<h1>Servidor OAuth Antigravity</h1><p>Pronto para capturar codigo!</p>")
            
        else:
            self.send_response(404)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"<h1>404 - Endpoint nao encontrado</h1>")
    
    def log_message(self, format, *args):
        # Suprimir logs padrão
        pass

def main():
    print("🚀 Servidor OAuth Simplificado")
    print("=" * 50)
    print(f"\n📡 Ouvindo em: http://localhost:{PORT}")
    print("\n🔗 URL para autenticar:")
    print("https://accounts.google.com/o/oauth2/v2/auth?client_id=1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A51121%2Foauth-callback&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcloud-platform+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcclog+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fexperimentsandconfigs&access_type=offline&prompt=consent&code_challenge=WlcSDQ_zjOby9xyKjiJKSM0jqCos4Yt211QTkV2d-PU&code_challenge_method=S256&state=296827e4f7b74281b5e979d2c152428f")
    print("\n📋 INSTRUÇÕES:")
    print("1. Abra a URL acima no SEU navegador")
    print("2. Faça login com: flavius9ia@gmail.com")
    print("3. Autorize os escopos")
    print("4. O código aparecerá AQUI no terminal")
    print("5. Cole o código no chat")
    print("\n" + "=" * 50)
    
    try:
        with socketserver.TCPServer(("", PORT), SimpleOAuthHandler) as httpd:
            print(f"\n✅ Servidor iniciado. Aguardando autenticação...")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Servidor encerrado.")
    except Exception as e:
        print(f"\n❌ Erro: {e}")

if __name__ == "__main__":
    main()