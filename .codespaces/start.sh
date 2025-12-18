#!/bin/bash

# Exposer les ports nécessaires
gh codespace ports visibility 5000:public -c $CODESPACE_NAME
gh codespace ports visibility 8081:public -c $CODESPACE_NAME
gh codespace ports visibility 5432:private -c $CODESPACE_NAME

echo "🌐 Ports exposés:"
echo "   - Backend API: 5000 (public)"
echo "   - Expo DevTools: 8081 (public)"
echo "   - PostgreSQL: 5432 (private)"
