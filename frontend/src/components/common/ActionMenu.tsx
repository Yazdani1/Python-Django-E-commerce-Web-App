import type { FC, ReactNode } from "react";
import { useState } from "react";
import {
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";

interface ExtraMenuItem {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

interface ActionMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  extraItems?: ExtraMenuItem[];
}

export const ActionMenu: FC<ActionMenuProps> = ({
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Delete",
  extraItems = [],
}) => {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const open = Boolean(anchor);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchor(e.currentTarget);
  };

  const handleClose = () => setAnchor(null);

  const handleEdit = () => {
    handleClose();
    onEdit?.();
  };

  const handleDelete = () => {
    handleClose();
    onDelete?.();
  };

  return (
    <>
      <Tooltip title="Actions">
        <IconButton size="small" onClick={handleOpen} aria-label="row actions">
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{ paper: { sx: { minWidth: 140, borderRadius: 0.5 } } }}
      >
        {onEdit && (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <Typography variant="body2">{editLabel}</Typography>
          </MenuItem>
        )}

        {extraItems.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => { handleClose(); item.onClick(); }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <Typography variant="body2">{item.label}</Typography>
          </MenuItem>
        ))}

        {(onEdit || extraItems.length > 0) && onDelete && <Divider />}

        {onDelete && (
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <Typography variant="body2" color="error">
              {deleteLabel}
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
