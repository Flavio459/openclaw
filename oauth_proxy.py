#!/usr/bin/env python3
"""
Proxy OAuth simples para capturar código de autorização
Executar: python3 oauth_proxy.py
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import webbrowser
import json
import sys

PORT = 51121

class OAuthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Manipula requisições GET para /oauth-callback"""
        parsed = urlparse(self.path)
        
        if parsed.path == '/oauth-callback':
            query = parse_qs(parsed.query)
            
            if 'code' in query:
                code = query['code'][0]
                print(f"\n🎉 CÓDIGO OAuth RECEBIDO: {code}")
                print(f"\n📋 Copie este código para o OpenClaw:")
                print(f"   {code}")
                
                # Salvar código em arquivo
                with open('/tmp/oauth_code.txt', 'w') as f:
                    f.write(code)
                
                # Responder ao navegador
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                response = f"""
                <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>✅ Autenticação Bem-sucedida!</h2>
                    <p>Código OAuth recebido e salvo.</p>
                    <p>Você pode fechar esta janela.</p>
                    <p><small>Código: {code[:20]}...</small></p>
                </body>
                </html>
                """
                self.wfile.write(response.encode())
                
                # Encerrar servidor após receber código
                print("\n🛑 Servidor será encerrado em 5 segundos...")
                import threading
                def shutdown():
                    import time
                    time.sleep(5)
                    print("👋 Servidor encerrado.")
                    sys.exit(0)
                threading.Thread(target=shutdown).start()
                
            else:
                self.send_response(400)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(b"<h1>Erro: Nenhum codigo recebido</h1>")
        
        elif parsed.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"<h1>Proxy OAuth Antigravity</h1><p>Servidor rodando na porta 51121</p>")
        
        else:
            self.send_response(404)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"<h1>404 - Pagina nao encontrada</h1>")
    
    def log_message(self, format, *args):
        """Suprime logs padrão do HTTP server"""
        pass

def main():
    print("🚀 Iniciando Proxy OAuth para Antigravity")
    print("=" * 50)
    print(f"\n📡 Servidor ouvindo em: http://localhost:{PORT}")
    print("\n🔗 URL de autorização:")
    print("https://accounts.google.com/o/oauth2/v2/auth?client_id=1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A51121%2Foauth-callback&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcloud-platform+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcclog+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fexperimentsandconfigs&access_type=offline&prompt=consent&code_challenge=WlcSDQ_zjOby9xyKjiJKSM0jqCos4Yt211QTkV2d-PU&code_challenge_method=S256&state=296827e4f7b74281b5e979d2c152428f")
    print("\n📋 INSTRUÇÕES:")
    print("1. Abra a URL acima no navegador")
    print("2. Faça login com: flavius9ia@gmail.com")
    print("3. Autorize os escopos solicitados")
    print("4. O código será capturado automaticamente")
    print("5. Copie o código para configurar no OpenClaw")
    print("\n" + "=" * 50)
    
    try:
        server = HTTPServer(('localhost', PORT), OAuthHandler)
        print(f"\n✅ Servidor iniciado. Aguardando autenticação...")
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Servidor encerrado pelo usuário.")
    except Exception as e:
        print(f"\n❌ Erro: {e}")

if __name__ == "__main__":
    main()