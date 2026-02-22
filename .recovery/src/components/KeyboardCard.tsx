          <Badge variant="info" size="sm" className="ml-3 shrink-0">
            {keyboard.size}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-3">
          <span>{keyboard.mountingStyle}</span>
          <span className="text-text-muted/40">|</span>
          <span>{keyboard.plateMaterial}</span>
          <span className="text-text-muted/40">|</span>
          <span>{keyboard.caseMaterial}</span>
        </div>

        <div className="flex items-center gap-1.5 mb-4">
          <Badge variant={keyboard.hotSwap ? "success" : "default"} size="sm">